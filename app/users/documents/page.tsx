'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import Loading from '../../../components/ui/Loading';

/* =========================
   CONSTANTS
========================= */
const DOCS = [
  { label: 'Aadhar Card', key: 'aadhar' },
  { label: 'College ID', key: 'collegeId' },
  { label: 'NOC', key: 'noc' },
];

/* =========================
   HELPERS
========================= */
const getUserFromCookies = () => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('user='));

  if (!cookie) return null;

  try {
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
  } catch {
    return null;
  }
};

const getViewableUrl = (url: string) => {
  if (!url) return url;
  if (url.includes('.pdf')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}view=true`;
  }
  return url;
};

/* =========================
   COMPONENT
========================= */
export default function InternDocuments() {
  const { theme } = useTheme();
  const router = useRouter();

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [docsData, setDocsData] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState<string | null>(null);

  /* =========================
     AUTH CHECK
  ========================= */
  useEffect(() => {
    const token = Cookies.get('token');
    const userFromCookies = getUserFromCookies();

    if (!token || !userFromCookies?.email) {
      router.replace('/landing/auth/login');
      return;
    }

    setUser(userFromCookies);
    setAuthLoading(false);
  }, [router]);

  const email = user?.email;

  /* =========================
     FETCH DOCUMENTS
  ========================= */
  useEffect(() => {
    if (!email) return;

    const fetchDocs = async () => {
      try {
        const res = await fetch(
          `/api/users/documents/get-intern-documents?email=${email}`
        );
        const data = await res.json();

        if (data.success) {
          setDocsData(data.documents || {});
        }
      } catch (err) {
        console.error('Failed to load documents', err);
      }
    };

    fetchDocs();
  }, [email]);

  /* =========================
     UPLOAD HANDLER
  ========================= */
  const uploadFile = async (file: File, docType: string) => {
    if (!email) return;

    setLoading(docType);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('docType', docType);
    formData.append('email', email);

    try {
      const res = await fetch('/api/users/documents/intern-documents', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setDocsData(prev => ({
          ...prev,
          [docType]: data.url,
        }));
      }
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setLoading(null);
    }
  };

  /* =========================
     LOADING SCREEN
  ========================= */
  if (authLoading) {
    return (
      <div className="mt-20">
        <Loading />
      </div>
    );
  }

  /* =========================
     UI
  ========================= */
  return (
    <div
      className={`p-6 min-h-screen ${
        theme === 'dark' ? 'bg-black' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Documents
          </h1>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
            Upload and view your documents
          </p>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOCS.map(doc => {
            const uploadedUrl = docsData[doc.key];

            return (
              <div
                key={doc.key}
                className={`rounded-xl p-6 border ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${
                        theme === 'dark'
                          ? 'text-white'
                          : 'text-gray-900'
                      }`}
                    >
                      {doc.label}
                    </h3>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG</p>
                  </div>
                </div>

                {/* File Input */}
                <input
                  type="file"
                  accept=".pdf,.jpg,.png"
                  disabled={loading === doc.key}
                  onChange={e =>
                    e.target.files &&
                    uploadFile(e.target.files[0], doc.key)
                  }
                  className="hidden"
                  id={`file-${doc.key}`}
                />

                {/* Upload Box */}
                <label
                  htmlFor={`file-${doc.key}`}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer ${
                    loading === doc.key ? 'opacity-50' : ''
                  }`}
                >
                  {loading === doc.key ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-sm mt-1">Uploading...</span>
                    </>
                  ) : uploadedUrl ? (
                    <>
                      {uploadedUrl.endsWith('.pdf') ? (
                        <>
                          <FileText className="w-10 h-10 text-red-500" />
                          <span className="text-sm mt-2 font-medium">
                            PDF Uploaded
                          </span>
                        </>
                      ) : (
                        <img
                          src={uploadedUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      )}
                      <span className="text-xs text-gray-400 mt-2">
                        Click to replace
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-500" />
                      <span className="text-sm mt-1">Click to upload</span>
                    </>
                  )}
                </label>

                {/* View */}
                <div className="mt-4">
                  {uploadedUrl ? (
                    <button
                      onClick={() =>
                        window.open(getViewableUrl(uploadedUrl), '_blank')
                      }
                      className="flex items-center gap-2 text-sm text-green-600 hover:underline"
                    >
                      <Eye className="w-4 h-4" />
                      View document
                    </button>
                  ) : (
                    <p className="text-xs text-gray-400">Not uploaded yet</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Box */}
        <div
          className={`mt-8 p-4 rounded-lg ${
            theme === 'dark'
              ? 'bg-gray-800 border border-gray-700'
              : 'bg-blue-50 border border-blue-200'
          }`}
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <p className="text-sm">
              PDFs open in browser view mode. Re-upload will replace the old
              document.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
