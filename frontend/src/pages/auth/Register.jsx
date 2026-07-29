import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/axios';

const Register = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const { user } = React.useContext(AuthContext);
    const navigate = useNavigate();
    const [apiError, setApiError] = useState('');
    const [loading, setLoading] = useState(false);

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
            // Adjust payload structure based on API
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
            await api.post('/auth/register', payload);
            navigate('/login', { state: { message: 'Registration successful! Please login.' } });
        } catch (error) {
            setApiError(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Create an Account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join Lifeline and start making an impact
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {apiError && <div className="p-3 bg-red-50 text-red-500 text-sm rounded-md">{apiError}</div>}
                    
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <input
                                type="text"
                                {...register('username', { required: 'Username is required' })}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                                placeholder="Username"
                            />
                            {errors.username && <span className="text-xs text-red-500">{errors.username.message}</span>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                {...register('email', { required: 'Email is required' })}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                                placeholder="Email address"
                            />
                            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">I am a...</label>
                            <select
                                {...register('role', { required: 'Please select a role' })}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                            >
                                <option value="">Select Role</option>
                                <option value="donor">Donor</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="beneficiary">Beneficiary</option>
                                <option value="ngo">NGO</option>
                            </select>
                            {errors.role && <span className="text-xs text-red-500">{errors.role.message}</span>}
                        </div>

                        {selectedRole === 'ngo' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Organization Name</label>
                                    <input
                                        type="text"
                                        {...register('org_name', { required: 'Organization Name is required for NGOs' })}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                                        placeholder="Organization Name"
                                    />
                                    {errors.org_name && <span className="text-xs text-red-500">{errors.org_name.message}</span>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                                    <input
                                        type="text"
                                        {...register('registration_number', { required: 'Registration Number is required for NGOs' })}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                                        placeholder="Registration Number"
                                    />
                                    {errors.registration_number && <span className="text-xs text-red-500">{errors.registration_number.message}</span>}
                                </div>
                            </>
                        )}

                        {selectedRole === 'volunteer' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Skills</label>
                                    <input
                                        type="text"
                                        {...register('skills')}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                                        placeholder="E.g., Medical, Teaching, Driving"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Availability</label>
                                    <input
                                        type="text"
                                        {...register('availability')}
                                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                                        placeholder="E.g., Weekends, Full-time"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                {...register('password', { 
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                })}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                                placeholder="Password"
                            />
                            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                {...register('confirmPassword', { 
                                    validate: value => value === password || 'Passwords do not match'
                                })}
                                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mt-1"
                                placeholder="Confirm Password"
                            />
                            {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Registering...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
