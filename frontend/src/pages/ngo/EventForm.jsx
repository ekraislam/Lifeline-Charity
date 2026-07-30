import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const EventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(!!id);
    const [apiError, setApiError] = useState('');
    const [categories, setCategories] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    // Watch dates for validation
    const eventDate = watch('event_date');
    const endDate = watch('end_date');
    const regDeadline = watch('registration_deadline');

    useEffect(() => {
        fetchCategories();
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data || []);
        } catch (error) {
            setCategories([
                { id: 1, name: 'Fundraiser' },
                { id: 2, name: 'Community Service' },
                { id: 3, name: 'Medical Camp' },
                { id: 4, name: 'Education' }
            ]);
        }
    };

    const fetchEventDetails = async () => {
        try {
            const res = await api.get(`/events/${id}`);
            const event = res.data;
            if (event) {
                const formData = {
                    title: event.title,
                    description: event.description,
                    category_id: event.category_id,
                    location: event.location,
                    max_volunteers: event.max_volunteers
                };
                if (event.event_date) {
                    const dateObj = new Date(event.event_date);
                    formData.event_date = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                }
                if (event.end_date) {
                    const dateObj = new Date(event.end_date);
                    formData.end_date = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                }
                if (event.registration_deadline) {
                    const dateObj = new Date(event.registration_deadline);
                    formData.registration_deadline = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                }
                
                reset(formData);

                if (event.cover_image) {
                    setPreviewImage(`${import.meta.env.VITE_API_URL}${event.cover_image}`);
                }
            }
        } catch (error) {
            setApiError('Failed to load event details.');
        } finally {
            setPageLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setApiError('Only image files are allowed');
                e.target.value = null;
                return;
            }
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data) => {
        if (data.registration_deadline && data.event_date) {
            if (new Date(data.registration_deadline) >= new Date(data.event_date)) {
                setApiError('Registration deadline must be before the event start date.');
                return;
            }
        }

        setLoading(true);
        setApiError('');
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            if (data.category_id) formData.append('category_id', data.category_id);
            if (data.location) formData.append('location', data.location);
            if (data.event_date) formData.append('event_date', data.event_date);
            if (data.end_date) formData.append('end_date', data.end_date);
            if (data.max_volunteers) formData.append('max_volunteers', data.max_volunteers);
            if (data.registration_deadline) formData.append('registration_deadline', data.registration_deadline);
            
            const file = fileInputRef.current?.files[0];
            if (file) {
                formData.append('cover_image', file);
            }

            if (id) {
                await api.put(`/events/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/events', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            if (user?.role === 'admin') {
                navigate('/admin/events');
            } else {
                navigate('/ngo/events');
            }
        } catch (error) {
            setApiError(error.response?.data?.message || 'Failed to save event');
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">
                        {id ? 'Edit Event Details' : 'Create New Event'}
                    </h2>
                    <p className="mt-2 text-primary-100 text-sm">
                        {id ? 'Update the information below to modify your event.' : 'Fill out the details below to launch a new event.'}
                    </p>
                </div>
                
                <div className="px-8 py-8">
                    {apiError && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start">
                            <span className="text-red-500 mr-3">⚠️</span>
                            <p className="text-sm text-red-700">{apiError}</p>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Basic Information</h3>
                            
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Title <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        {...register('title', { required: 'Event title is required' })} 
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                                        placeholder="E.g., Community Beach Cleanup"
                                    />
                                    {errors.title && <span className="text-xs text-red-500 mt-1 block">{errors.title.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-red-500">*</span></label>
                                    <textarea 
                                        rows="4" 
                                        {...register('description', { required: 'Description is required' })} 
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Describe what the event is about..."
                                    ></textarea>
                                    {errors.description && <span className="text-xs text-red-500 mt-1 block">{errors.description.message}</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                    <select 
                                        {...register('category_id')} 
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                                    <input 
                                        type="text" 
                                        {...register('location')} 
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                                        placeholder="E.g., Central Park"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Date & Time Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Schedule & Registration</h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date & Time <span className="text-red-500">*</span></label>
                                    <input 
                                        type="datetime-local" 
                                        {...register('event_date', { required: 'Start Date is required' })} 
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                                    />
                                    {errors.event_date && <span className="text-xs text-red-500 mt-1 block">{errors.event_date.message}</span>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date & Time <span className="text-red-500">*</span></label>
                                    <input 
                                        type="datetime-local" 
                                        {...register('end_date', { 
                                            required: 'End Date is required',
                                            validate: value => !eventDate || new Date(value) > new Date(eventDate) || 'End Date must be after Start Date'
                                        })} 
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                                    />
                                    {errors.end_date && <span className="text-xs text-red-500 mt-1 block">{errors.end_date.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Deadline</label>
                                    <input 
                                        type="datetime-local" 
                                        {...register('registration_deadline', {
                                            validate: value => !value || !eventDate || new Date(value) < new Date(eventDate) || 'Deadline must be before Start Date'
                                        })} 
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                                    />
                                    {errors.registration_deadline && <span className="text-xs text-red-500 mt-1 block">{errors.registration_deadline.message}</span>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Volunteers</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        {...register('max_volunteers')} 
                                        className="block w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                                        placeholder="Leave empty for unlimited"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media Section */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Media</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover Image</label>
                                <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl hover:border-primary-500 transition-colors bg-gray-50 dark:bg-gray-900 cursor-pointer">
                                    <div className="space-y-1 text-center">
                                        {previewImage ? (
                                            <div className="relative inline-block">
                                                <img src={previewImage} alt="Cover preview" className="h-48 w-full object-cover rounded-lg shadow-md" />
                                                <button type="button" onClick={(e) => { e.preventDefault(); setPreviewImage(null); if(fileInputRef.current) fileInputRef.current.value = null; }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                                    <span className="relative bg-transparent rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                                        <span>Upload a file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                                                    </span>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                                            </>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-xl text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none transition-all shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-xl shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 transition-all"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Event'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventForm;
