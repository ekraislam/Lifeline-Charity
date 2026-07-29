import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const EventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(!!id);
    const [apiError, setApiError] = useState('');
    const [categories, setCategories] = useState([]);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

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
            const event = res.data.event;
            if (event) {
                setValue('title', event.title);
                setValue('description', event.description);
                setValue('category_id', event.category_id);
                setValue('location', event.location);
                if (event.event_date) {
                    const dateObj = new Date(event.event_date);
                    const formatted = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    setValue('event_date', formatted);
                }
                setValue('max_volunteers', event.max_volunteers);
                if (event.registration_deadline) {
                    setValue('registration_deadline', event.registration_deadline.split('T')[0]);
                }
                setValue('status', event.status);
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
        setLoading(true);
        setApiError('');
        try {
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            if (data.category_id) formData.append('category_id', data.category_id);
            if (data.location) formData.append('location', data.location);
            if (data.event_date) formData.append('event_date', data.event_date);
            if (data.max_volunteers) formData.append('max_volunteers', data.max_volunteers);
            if (data.registration_deadline) formData.append('registration_deadline', data.registration_deadline);
            if (data.status) formData.append('status', data.status);
            
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
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {id ? 'Edit Event' : 'Create New Event'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Fill out the form below to {id ? 'update the' : 'create a new'} event.
                    </p>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                    {apiError && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                            {apiError}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Event Title</label>
                                <input type="text" {...register('title', { required: 'Title is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                                {errors.title && <span className="text-xs text-red-500">{errors.title.message}</span>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea rows="4" {...register('description', { required: 'Description is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"></textarea>
                                {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Category</label>
                                <select {...register('category_id')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                                    <option value="">Select a category</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Location</label>
                                <input type="text" {...register('location')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Event Date & Time</label>
                                <input type="datetime-local" {...register('event_date', { required: 'Event Date is required' })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                                {errors.event_date && <span className="text-xs text-red-500">{errors.event_date.message}</span>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
                                <input type="date" {...register('registration_deadline')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Max Volunteers</label>
                                <input type="number" min="1" {...register('max_volunteers')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select {...register('status')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image (Must be an image file)</label>
                                <div className="flex items-center space-x-4">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        ref={fileInputRef} 
                                        onChange={handleImageChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                    />
                                </div>
                                {previewImage && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-500 mb-2">Image Preview:</p>
                                        <img src={previewImage} alt="Preview" className="h-48 w-auto rounded object-cover shadow-sm border border-gray-200" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Event'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventForm;
