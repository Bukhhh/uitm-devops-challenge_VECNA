'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import useAuthStore from '@/stores/authStore';
import { Shield, AlertTriangle, Clock, Users, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ContentWrapper from '@/components/ContentWrapper';

interface UserInfo {
    email: string;
    role: string;
}

interface Log {
  id: string;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: string;
  user?: UserInfo;
}

// Komponen utama
export default function AdminDashboard() {
  // FIX: Gunakan selektor sederhana tanpa objek untuk menghindari re-render yang tidak perlu
  const user = useAuthStore(state => state.user);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const token = useAuthStore(state => state.token);
  const initializeAuth = useAuthStore(state => state.initializeAuth);
  
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inisialisasi auth saat component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeAuth();
    }
  }, [initializeAuth]);

  // FIX 1: Balut fetchLogs dengan useCallback
  const fetchLogs = useCallback(async () => {
    if (!token) {
        setLoading(false);
        return;
    }
    
    // 2. Check Authorization
    if (user?.role !== 'ADMIN') {
         setError("Akses Ditolak: Hanya pentadbir boleh melihat halaman ini.");
         setLoading(false);
         return;
    }

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:3000';
      const res = await fetch(`${API_BASE}/api/auth/activity-logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
       
      if (res.status === 403) { 
             setError("Akses Ditolak: Sila pastikan anda login sebagai ADMIN.");
             return;
      }

      if (!res.ok) {
          throw new Error(`Gagal memuatkan log: Status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      } else {
          throw new Error(data.message || 'Gagal memuatkan log.');
      }
    } catch (err) {
      console.error("❌ Ralat fetching log:", err);
      setError(err instanceof Error ? err.message : 'Gagal memuatkan dashboard.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.role]);

  // FIX 2: Gunakan useEffect yang tepat untuk memanggil fetchLogs
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      if (!isLoggedIn) {
        if (isMounted) setLoading(false);
        return;
      }
      
      if (isMounted && user?.role === 'ADMIN') {
        await fetchLogs();
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn, user?.role, fetchLogs]);

  // FIX 3: Tambahkan loading state awal untuk menghindari infinite loop
  if (loading && !error) {
    return (
      <ContentWrapper withFooter={false}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600" />
            <p className='text-slate-600'>Memuatkan Log Aktiviti Keselamatan...</p>
          </div>
        </div>
      </ContentWrapper>
    );
  }

  // FIX 4: Periksa role setelah loading selesai
  if (!isLoggedIn && !loading) {
    return (
      <ContentWrapper withFooter={false}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-sans font-medium text-slate-900">
                Login Required
              </h3>
              <p className="text-base text-slate-500 leading-relaxed">
                Sila log masuk untuk melihat dashboard ini.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </ContentWrapper>
    );
  }

  if (user?.role !== 'ADMIN' && !loading) {
    return (
      <ContentWrapper withFooter={false}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-sans font-medium text-slate-900">
                Access Denied
              </h3>
              <p className="text-base text-slate-500 leading-relaxed">
                Hanya pentadbir (administrator) boleh melihat halaman ini.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Kembali ke Laman Utama
            </Link>
          </div>
        </div>
      </ContentWrapper>
    );
  }

  if (error) {
    return (
      <ContentWrapper withFooter={false}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-sans font-medium text-slate-900">
                Error: {error}
              </h3>
              <p className="text-base text-slate-500 leading-relaxed">
                Sila pastikan Backend Node.js (Port 3000) sedang berjalan dan anda telah menukar role kepada ADMIN.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors duration-200"
            >
              Kembali ke Laman Utama
            </Link>
          </div>
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper withFooter={false}>
      <div className="py-8">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
          <div className="p-3 bg-yellow-100 rounded-xl text-yellow-800">
            <Shield size={32} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Security Dashboard</h1>
            <p className="text-slate-600 mt-1">
              Selamat datang, {user?.firstName || user?.email}. Memantau peristiwa sistem (Modul 5)
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 font-medium border-b border-slate-200">
                <tr>
                  <th className="p-4 min-w-[80px]">Status</th>
                  <th className="p-4 min-w-[200px]">Jenis Aktiviti</th>
                  <th className="p-4 min-w-[200px]">Pengguna / Emel</th>
                  <th className="p-4 min-w-[200px]">Butiran</th>
                  <th className="p-4 min-w-[150px]">Masa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.length > 0 ? (
                  logs.map((log) => {
                    const isAlert = log.action.includes('SUSPICIOUS') || log.action.includes('FAILED');
                    const statusColor = isAlert ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700';
                    const statusIcon = isAlert ? <AlertTriangle size={12} /> : <CheckCircle size={12} />;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusIcon} {isAlert ? 'RISIKO' : 'OK'}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-900">{log.action}</td>
                        <td className="p-4 text-slate-600">
                          {log.user?.email || (
                            <span className="text-slate-400 italic flex items-center gap-1">
                              <Users size={14}/> Anon
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 text-xs max-w-xs" title={log.details}>
                          {log.details ? log.details.substring(0, 100) : log.ipAddress}
                        </td>
                        <td className="p-4 text-slate-400 text-xs flex items-center gap-2">
                          <Clock size={14} />
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      Tiada aktiviti keselamatan terbaru ditemui.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Stats summary */}
        {logs.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-2">Jumlah Log</h3>
              <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-2">Aktiviti Berisiko</h3>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.action.includes('SUSPICIOUS') || log.action.includes('FAILED')).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-700 mb-2">Aktiviti Normal</h3>
              <p className="text-2xl font-bold text-green-600">
                {logs.filter(log => !log.action.includes('SUSPICIOUS') && !log.action.includes('FAILED')).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </ContentWrapper>
  );
}