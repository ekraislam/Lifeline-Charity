import React, { useState } from 'react';
import api from '../../api/axios';

const reports = [
    {
        key: 'campaigns',
        title: 'Campaign Report',
        description: 'All campaigns with NGO name, category, goal & raised amounts, status, and dates.',
        icon: '📋',
        color: 'from-blue-500 to-blue-600',
        endpoint: '/admin/export/campaigns',
        filename: 'campaigns_report.xlsx',
    },
    {
        key: 'donations',
        title: 'Donation Report',
        description: 'All donation transactions with donor info, campaign, amount, and payment status.',
        icon: '💰',
        color: 'from-green-500 to-green-600',
        endpoint: '/admin/export/donations',
        filename: 'donations_report.xlsx',
    },
    {
        key: 'users',
        title: 'User Report',
        description: 'All registered users with role, email, account status, and join date.',
        icon: '👥',
        color: 'from-purple-500 to-purple-600',
        endpoint: '/admin/export/users',
        filename: 'users_report.xlsx',
    },
];

const AdminExportReports = () => {
    const [loading, setLoading] = useState({});
    const [success, setSuccess] = useState({});

    const handleExport = async (report) => {
        setLoading(prev => ({ ...prev, [report.key]: true }));
        setSuccess(prev => ({ ...prev, [report.key]: false }));
        try {
            const response = await api.get(report.endpoint, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', report.filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            setSuccess(prev => ({ ...prev, [report.key]: true }));
            setTimeout(() => setSuccess(prev => ({ ...prev, [report.key]: false })), 3000);
        } catch (e) {
            console.error(e);
            alert(`Failed to export ${report.title}`);
        } finally {
            setLoading(prev => ({ ...prev, [report.key]: false }));
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Export Reports</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Download detailed Excel reports for campaigns, donations, and users.
                    Each report includes a summary and full data table.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {reports.map(report => (
                    <div key={report.key} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className={`bg-gradient-to-r ${report.color} p-6 text-white`}>
                            <div className="text-4xl mb-2">{report.icon}</div>
                            <h3 className="text-lg font-bold">{report.title}</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 min-h-[48px]">{report.description}</p>
                            <div className="text-xs text-gray-400 mb-4 space-y-1">
                                <div className="flex items-center gap-1">
                                    <span>✓</span><span>Report Title & Generated Date</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>✓</span><span>Summary Statistics</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span>✓</span><span>Full Data Table (.xlsx)</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleExport(report)}
                                disabled={loading[report.key]}
                                className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2
                                    ${success[report.key]
                                        ? 'bg-green-100 text-green-700 border border-green-300'
                                        : `bg-gradient-to-r ${report.color} text-white hover:opacity-90 shadow`
                                    } ${loading[report.key] ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {loading[report.key] ? (
                                    <><span className="animate-spin">⟳</span> Generating...</>
                                ) : success[report.key] ? (
                                    <>✓ Downloaded!</>
                                ) : (
                                    <>⬇ Download Excel</>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
                <h4 className="font-semibold text-blue-900 mb-2">📌 About Reports</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Reports are generated in real-time from the live database</li>
                    <li>• Each Excel file includes a title, generation timestamp, summary stats, and a full color-coded data table</li>
                    <li>• Files are in .xlsx format compatible with Microsoft Excel, Google Sheets, and LibreOffice</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminExportReports;
