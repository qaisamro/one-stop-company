import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { axiosInstance } from '../api/axiosConfig'; // Assuming axiosInstance is defined

const AdminTeam = () => {
    const { t } = useTranslation();
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState({
        name: '',
        position: '',
        photoFile: null,
        language: 'ar',
        socials: [{ url: '', platform: '' }],
        editingId: null, // Initialize editingId
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') {
            navigate('/admin/login');
        } else {
            fetchTeam();
        }
    }, [form.language, navigate]);

    const fetchTeam = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/team?lang=${form.language}`);
            setMembers(response.data);
            setError('');
        } catch (err) {
            console.error('Error fetching team:', err.response?.data || err.message);
            setError(err.response?.data?.error || t('failed_to_load_team') || 'فشل تحميل أعضاء الفريق');
            if (err.response?.status === 401) {
                setTimeout(() => navigate('/admin/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm({ ...form, photoFile: file });
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            setForm({ ...form, photoFile: null });
            setPhotoPreview(null);
        }
    };

    const handleSocialChange = (index, e) => {
        const newSocials = [...form.socials];
        newSocials[index][e.target.name] = e.target.value;
        setForm({ ...form, socials: newSocials });
    };

    const handleAddSocial = () => {
        setForm({ ...form, socials: [...form.socials, { url: '', platform: '' }] });
    };

    const handleRemoveSocial = (index) => {
        const newSocials = form.socials.filter((_, i) => i !== index);
        setForm({ ...form, socials: newSocials });
    };

    const handleAdd = async () => {
        if (!form.name || !form.position) {
            setError(t('fill_required_fields') || 'يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('position', form.position);
        formData.append('language', form.language);
        if (form.photoFile) {
            formData.append('photo', form.photoFile);
        }
        // ********************* التعديل هنا *********************
        formData.append('socials', JSON.stringify(form.socials.filter((s) => s.url && s.url.trim() !== '')));

        try {
            await axiosInstance.post('/api/team', formData);
            setMessage(t('member_added') || 'تمت الإضافة بنجاح! ✅');
            setError('');
            setForm({
                name: '',
                position: '',
                photoFile: null,
                language: form.language,
                socials: [{ url: '', platform: '' }],
                editingId: null,
            });
            setPhotoPreview(null);
            fetchTeam();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error adding member:', err.response?.data || err.message);
            setError(err.response?.data?.error || t('failed_to_add_member') || 'فشل إضافة عضو الفريق');
            if (err.response?.status === 401) {
                setTimeout(() => navigate('/admin/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (member) => {
        setForm({
            name: member.name || '',
            position: member.position || '',
            photoFile: null,
            language: member.language || 'ar',
            // تأكد من أن social_url موجود أو استخدم url إذا كان هذا هو الاسم المتوقع
            socials: member.socials && member.socials.length > 0
                ? member.socials.map(s => ({
                    url: s.social_url || '', // استخدم social_url من الباك إند
                    platform: s.platform || ''
                  }))
                : [{ url: '', platform: '' }],
            editingId: member.id,
        });
        setPhotoPreview(member.photo_url || null);
        setError('');
        setMessage('');
    };

    const handleUpdate = async () => {
        if (!form.name || !form.position) {
            setError(t('fill_required_fields') || 'يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('position', form.position);
        formData.append('language', form.language);
        if (form.photoFile) {
            formData.append('photo', form.photoFile);
        } else if (photoPreview === null) {
            formData.append('photo', '');
        }
        // ********************* التعديل هنا *********************
        formData.append('socials', JSON.stringify(form.socials.filter((s) => s.url && s.url.trim() !== '')));
        formData.append('_method', 'PUT');

        try {
            await axiosInstance.post(`/api/team/${form.editingId}`, formData);
            setMessage(t('member_updated') || 'تم التحديث بنجاح! ✅');
            setError('');
            setForm({
                name: '',
                position: '',
                photoFile: null,
                language: form.language,
                socials: [{ url: '', platform: '' }],
                editingId: null,
            });
            setPhotoPreview(null);
            fetchTeam();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error updating member:', err.response?.data || err.message);
            setError(err.response?.data?.error || t('failed_to_update_member') || 'فشل تحديث عضو الفريق');
            if (err.response?.status === 401) {
                setTimeout(() => navigate('/admin/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axiosInstance.delete(`/api/team/${id}`);
            setMessage(t('member_deleted') || 'تم الحذف بنجاح! ✅');
            setError('');
            fetchTeam();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            console.error('Error deleting member:', err.response?.data || err.message);
            setError(err.response?.data?.error || t('failed_to_delete_member') || 'فشل حذف عضو الفريق');
            if (err.response?.status === 401) {
                setTimeout(() => navigate('/admin/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target) && window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        };
        if (isSidebarOpen && window.innerWidth < 768) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSidebarOpen]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-row-reverse font-sans">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-60 md:hidden z-40 transition-opacity duration-300"
                    onClick={toggleSidebar}
                ></div>
            )}

            <div className="flex-1 p-4 sm:p-6 md:p-8">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden mb-6 text-gray-700 focus:outline-none p-3 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                    aria-label={t('open_sidebar') || 'فتح الشريط الجانبي'}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-3xl mx-auto transition-all duration-300">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">
                        {t('manage_team') || 'إدارة الفريق'}
                    </h2>
                    {loading && (
                        <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <p>{t('loading') || 'جار التحميل...'}</p>
                        </div>
                    )}
                    {error && (
                        <p className="text-red-500 bg-red-50 p-3 rounded-lg mb-4 animate-pulse">{error}</p>
                    )}
                    {message && (
                        <p className="text-green-600 bg-green-50 p-3 rounded-lg mb-4 animate-fade-in">{message}</p>
                    )}

                    <div className="space-y-4">
                        <select
                            name="language"
                            value={form.language}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-gray-50 text-gray-700 transition-shadow duration-200 hover:shadow-md"
                        >
                            <option value="ar">العربية</option>
                            <option value="en">English</option>
                        </select>

                        <input
                            name="name"
                            placeholder={t('member_name') || 'الاسم'}
                            value={form.name}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />
                        <input
                            name="position"
                            placeholder={t('member_position') || 'الوظيفة'}
                            value={form.position}
                            onChange={handleChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                        />

                        <label className="block text-gray-700 text-sm font-bold mt-4">
                            {t('social_media_links') || 'روابط التواصل الاجتماعي:'}
                        </label>
                        {form.socials.map((social, index) => (
                            <div key={index} className="flex gap-2 mb-2 items-center">
                                <input
                                    name="url"
                                    placeholder={t('social_url') || 'الرابط (مثال: https://linkedin.com/in/...) '}
                                    value={social.url || ''} // تأكد من أن القيمة ليست undefined
                                    onChange={(e) => handleSocialChange(index, e)}
                                    className="flex-1 p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                                />
                                <select
                                    name="platform"
                                    value={social.platform || ''} // تأكد من أن القيمة ليست undefined
                                    onChange={(e) => handleSocialChange(index, e)}
                                    className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
                                >
                                    <option value="">{t('select_platform') || 'اختر المنصة (اختياري)'}</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="twitter">Twitter</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="instagram">Instagram</option>
                                    <option value="youtube">YouTube</option>
                                    <option value="github">GitHub</option>
                                    <option value="website">Website</option>
                                    <option value="whatsapp">WhatsApp</option>
                                    <option value="tiktok">TikTok</option>
                                    <option value="snapchat">Snapchat</option>
                                    <option value="telegram">Telegram</option>
                                    <option value="behance">Behance</option>
                                    <option value="dribbble">Dribbble</option>
                                    <option value="x">X</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSocial(index)}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    aria-label={t('remove_social_link') || 'إزالة الرابط'}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddSocial}
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
                        >
                            {t('add_social_link') || 'إضافة رابط تواصل اجتماعي'}
                        </button>

                        <label htmlFor="photo-upload" className="block text-gray-700 text-sm font-bold mt-4 mb-2">
                            {t('member_photo') || 'صورة العضو (اختياري)'}
                        </label>
                        <input
                            id="photo-upload"
                            type="file"
                            name="photo"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {photoPreview && (
                            <div className="mt-4 flex flex-col items-center">
                                <p className="text-gray-600 mb-2">{t('photo_preview') || 'معاينة الصورة:'}</p>
                                <img
                                    src={photoPreview}
                                    alt="Photo Preview"
                                    className="w-32 h-32 object-cover rounded-md shadow-lg border-2 border-blue-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPhotoPreview(null);
                                        setForm({ ...form, photoFile: null });
                                    }}
                                    className="mt-2 text-red-500 hover:text-red-700 text-sm"
                                >
                                    {t('remove_photo') || 'إزالة الصورة'}
                                </button>
                            </div>
                        )}
                        <button
                            onClick={form.editingId ? handleUpdate : handleAdd}
                            className={`${
                                form.editingId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                            } text-white py-3 px-6 rounded-lg w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-4`}
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    <span>{form.editingId ? (t('updating') || 'جار التحديث...') : (t('adding') || 'جار الإضافة...')}</span>
                                </div>
                            ) : form.editingId ? (t('update') || 'تحديث') : (t('add') || 'إضافة')}
                        </button>
                        {form.editingId && (
                            <button
                                onClick={() => {
                                    setForm({
                                        name: '',
                                        position: '',
                                        photoFile: null,
                                        language: form.language,
                                        socials: [{ url: '', platform: '' }],
                                        editingId: null,
                                    });
                                    setPhotoPreview(null);
                                    setError('');
                                    setMessage('');
                                }}
                                className="bg-gray-500 text-white py-3 px-6 rounded-lg w-full hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg mt-2"
                            >
                                {t('cancel_edit') || 'إلغاء التعديل'}
                            </button>
                        )}
                    </div>

                    <hr className="my-6 border-gray-200" />

                    <ul className="space-y-4">
                        {members.length === 0 && !error && !loading ? (
                            <p className="text-gray-600 text-center">{t('no_team_members') || 'لا يوجد أعضاء في الفريق حاليًا'}</p>
                        ) : (
                            members.map((member) => (
                                <li
                                    key={member.id}
                                    className="border border-gray-200 p-4 rounded-lg flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-4">
                                        {member.photo_url && (
                                            <img
                                                src={member.photo_url}
                                                alt={`${member.name} photo`}
                                                className="w-16 h-16 object-cover rounded-full shadow-md border-2 border-blue-200"
                                            />
                                        )}
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                                            <p className="text-gray-600">{member.position}</p>
                                            {member.socials && member.socials.length > 0 && (
                                                <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                                                    {member.socials.map((social, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={social.social_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="hover:underline text-blue-500"
                                                        >
                                                            {social.platform ? social.platform.charAt(0).toUpperCase() + social.platform.slice(1) : 'Link'}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(member)}
                                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 p-2 rounded-md hover:bg-blue-50"
                                            disabled={loading}
                                        >
                                            ✏️ {t('edit') || 'تعديل'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 p-2 rounded-md hover:bg-red-50"
                                            disabled={loading}
                                        >
                                            🗑 {t('delete') || 'حذف'}
                                        </button>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminTeam;