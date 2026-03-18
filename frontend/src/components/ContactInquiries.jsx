import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Mail, MessageSquare, Clock, Trash2, Send, Phone } from 'lucide-react';
import authFetch from '../utils/authFetch';

const ContactInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const response = await authFetch(`/admin_inquiries.php`);
            if (!response.ok) {
                throw new Error('Failed to fetch inquiries.');
            }
            const data = await response.json();
            setInquiries(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this inquiry?')) {
            try {
                const response = await authFetch(`/admin_inquiries.php?id=${id}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    fetchInquiries();
                } else {
                    throw new Error(data.message || 'Failed to delete the inquiry.');
                }
            } catch (err) {
                alert(`Error: ${err.message}`);
            }
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading inquiries...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Form Inquiries</h2>
            {inquiries.length === 0 ? (
                <p className="text-gray-500">No inquiries found.</p>
            ) : (
                <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                        <div key={inquiry.id} className="border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-lg">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">{inquiry.name}</h3>
                                <span className="text-xs text-gray-400 flex items-center pt-1">
                                    <Clock size={14} className="mr-1" />
                                    {new Date(inquiry.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mb-3">
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Mail size={14} className="mr-2 text-gray-400" />
                                    <a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>
                                </p>
                                {inquiry.phone && (
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Phone size={14} className="mr-2 text-gray-400" />
                                    <span>{inquiry.phone}</span>
                                </p>
                                )}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap flex items-start bg-gray-50 p-3 rounded-md">
                                <MessageSquare size={14} className="mr-2 mt-1 flex-shrink-0 text-gray-400" />
                                <span>{inquiry.message}</span>
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-4">
                                <a 
                                    href={`mailto:${inquiry.email}`}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors shadow-sm"
                                >
                                    <Send size={12} />
                                    Reply
                                </a>
                                <button 
                                    onClick={() => handleDelete(inquiry.id)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                >
                                    <Trash2 size={12} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContactInquiries;

