import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { user } = React.useContext(AuthContext);
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const password = watch("password");
    const selectedRole = watch("role");

    const onSubmit = async (data) => {
        setLoading(true);
        setApiError('');
        try {
            const payload = {
                name: data.username,
                email: data.email,
                password: data.password,
                role: data.role
            };

            if (data.role === 'ngo') {
                payload.org_name = data.org_name;
                payload.registration_number = data.registration_number;
            } else if (data.role === 'volunteer') {
                payload.skills = data.skills;
                payload.availability = data.availability;
            }
            let apiData = payload;
            let headers = {};

            if (data.role === 'ngo') {
                const formData = new FormData();
                Object.keys(payload).forEach(key => formData.append(key, payload[key]));
                
                if (data.documents && data.documents.length > 0) {
                    for (let i = 0; i < data.documents.length; i++) {
                        formData.append('documents', data.documents[i]);
                    }
                }
                apiData = formData;
                headers = { 'Content-Type': 'multipart/form-data' };
            }

            await api.post('/auth/register', apiData, { headers });
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (error) {
            setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-lg w-full space-y-8 card-premium p-8 sm:p-10">
                <div className="text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">Join Lifeline</span>
                    <h2 className="font-display text-3xl font-black text-gray-900 dark:text-white mt-1">Create an Account</h2>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Join our transparent network of donors, NGOs, beneficiaries, and volunteers
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
                    {apiError && (
                        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{apiError}</span>
                        </div>
                    )}
                    
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">Full Name / Username</label>
                            <input
                                type="text"
                                {...register('username', { required: 'Username is required' })}
                                className="w-full mt-1"
                                placeholder="Your full name"
                            />
                            {errors.username && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.username.message}</span>}
                        </div>
                        
                        <div>
                            <label className="form-label">Email Address</label>
                            <input
                                type="email"
                                {...register('email', { required: 'Email is required' })}
                                className="w-full mt-1"
                                placeholder="name@example.com"
                            />
                            {errors.email && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className="form-label">Select Your Role</label>
                            <select
                                {...register('role', { required: 'Please select a role' })}
                                className="w-full mt-1"
                            >
                                <option value="">Select Role</option>
                                <option value="donor">Donor (Support Campaigns)</option>
                                <option value="volunteer">Volunteer (Join Events & Tasks)</option>
                                <option value="beneficiary">Beneficiary (Request Help)</option>
                                <option value="ngo">NGO (Manage Campaigns)</option>
                            </select>
                            {errors.role && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.role.message}</span>}
                        </div>

                        {selectedRole === 'ngo' && (
                            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-800 space-y-3">
                                <div>
                                    <label className="form-label text-indigo-700 dark:text-indigo-300">Organization Name</label>
                                    <input
                                        type="text"
                                        {...register('org_name', { required: 'Organization Name is required for NGOs' })}
                                        className="w-full mt-1"
                                        placeholder="Registered NGO Title"
                                    />
                                    {errors.org_name && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.org_name.message}</span>}
                                </div>
                                <div>
                                    <label className="form-label text-indigo-700 dark:text-indigo-300">Registration Number</label>
                                    <input
                                        type="text"
                                        {...register('registration_number', { required: 'Registration Number is required for NGOs' })}
                                        className="w-full mt-1"
                                        placeholder="Govt. Registration ID"
                                    />
                                    {errors.registration_number && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.registration_number.message}</span>}
                                </div>
                                <div>
                                    <label className="form-label text-indigo-700 dark:text-indigo-300">Proof Documents (Images)</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        {...register('documents', { required: 'Please upload at least one proof document' })}
                                        className="w-full mt-1 text-xs"
                                    />
                                    {errors.documents && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.documents.message}</span>}
                                </div>
                            </div>
                        )}

                        {selectedRole === 'volunteer' && (
                            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 space-y-3">
                                <div>
                                    <label className="form-label text-emerald-700 dark:text-emerald-300">Skills</label>
                                    <input
                                        type="text"
                                        {...register('skills')}
                                        className="w-full mt-1"
                                        placeholder="E.g., Medical Assistance, Teaching, Logistics"
                                    />
                                </div>
                                <div>
                                    <label className="form-label text-emerald-700 dark:text-emerald-300">Availability</label>
                                    <input
                                        type="text"
                                        {...register('availability')}
                                        className="w-full mt-1"
                                        placeholder="E.g., Weekends, Evenings"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    {...register('password', { 
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                    })}
                                    className="w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.password.message}</span>}
                        </div>
                        
                        <div>
                            <label className="form-label">Confirm Password</label>
                            <div className="relative mt-1">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    {...register('confirmPassword', { 
                                        validate: value => value === password || 'Passwords do not match'
                                    })}
                                    className="w-full pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white cursor-pointer"
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="text-[11px] text-rose-500 font-bold mt-1 block">{errors.confirmPassword.message}</span>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-4 text-xs uppercase tracking-wider disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="font-extrabold text-primary-600 dark:text-primary-400 hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
