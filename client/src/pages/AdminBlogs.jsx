import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    language: 'ar',
    author: 'Admin',
    category: 'Construction',
    content: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [existingAdditionalImageUrls, setExistingAdditionalImageUrls] = useState([]);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    } else {
      fetchBlogs();
    }
  }, [form.language, navigate]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://one-stop-company-1.onrender.com/api/blogs?lang=${form.language}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setBlogs(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuillChange = (value) => {
    setForm({ ...form, content: value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleAdditionalFilesChange = (e) => {
    setAdditionalImageFiles(Array.from(e.target.files));
  };

  const handleRemoveAdditionalImage = (indexToRemove) => {
    setExistingAdditionalImageUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleEdit = (blog) => {
    setEditingBlogId(blog.id);
    setForm({
      title: blog.title,
      description: blog.description,
      date: blog.date,
      language: blog.language,
      author: blog.author || 'Admin',
      category: blog.category || 'Construction',
      content: blog.content || ''
    });
    setCurrentImageUrl(blog.image);
    setExistingAdditionalImageUrls(blog.additional_images || []);
    setImageFile(null);
    setAdditionalImageFiles([]);
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingBlogId(null);
    setForm({ title: '', description: '', date: '', language: form.language, author: 'Admin', category: 'Construction', content: '' });
    setImageFile(null);
    setAdditionalImageFiles([]);
    setCurrentImageUrl('');
    setExistingAdditionalImageUrls([]);
    setError('');
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.date || !form.content) {
      setError('Please fill in all required fields (including detailed content).');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('date', form.date);
    formData.append('language', form.language);
    formData.append('author', form.author);
    formData.append('category', form.category);
    formData.append('content', form.content);

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (currentImageUrl && editingBlogId) {
      formData.append('currentImage', currentImageUrl);
    }

    if (existingAdditionalImageUrls.length > 0) {
      formData.append('existingAdditionalImages', JSON.stringify(existingAdditionalImageUrls));
    }

    additionalImageFiles.forEach((file) => {
      formData.append('additionalImages', file);
    });

    try {
      if (editingBlogId) {
        await axios.put(`https://one-stop-company-1.onrender.com/api/blogs/${editingBlogId}`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Blog updated successfully! ✅');
      } else {
        await axios.post('https://one-stop-company-1.onrender.com/api/blogs', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        setMessage('Blog added successfully! ✅');
      }

      setForm({ title: '', description: '', date: '', language: form.language, author: 'Admin', category: 'Construction', content: '' });
      setImageFile(null);
      setAdditionalImageFiles([]);
      setCurrentImageUrl('');
      setExistingAdditionalImageUrls([]);
      setEditingBlogId(null);
      fetchBlogs();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(editingBlogId ? 'Update blog error:' : 'Add blog error:', err.response ? err.response.data : err);
      setError((editingBlogId ? 'Failed to update blog: ' : 'Failed to add blog: ') + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.delete(`https://one-stop-company-1.onrender.com/api/blogs/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Blog deleted successfully! ✅');
      fetchBlogs();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Delete blog error:', err.response ? err.response.data : err);
      setError('Failed to delete blog: ' + (err.response?.data?.error || err.message));
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

  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
  ];

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
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="bg-white shadow-xl p-6 sm:p-8 rounded-2xl w-full max-w-3xl mx-auto transition-all duration-300">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 tracking-tight">
            {editingBlogId ? 'Edit Blog' : 'Manage Blogs'}
          </h2>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p>Loading...</p>
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
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <textarea
              name="description"
              placeholder="Short Description"
              value={form.description}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
              rows="3"
            />
            <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Detailed Content:</label>
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={handleQuillChange}
              modules={modules}
              formats={formats}
              className="bg-gray-50 rounded-lg shadow-md mb-4"
            />
            <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Main Image (optional, replaces existing):</label>
            <input
              type="file"
              name="image"
              onChange={handleFileChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
              accept="image/*"
            />
            {currentImageUrl && editingBlogId && !imageFile && (
              <p className="text-sm text-gray-500 mt-2">
                Current Image: <a href={currentImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{currentImageUrl.split('/').pop()}</a>
              </p>
            )}
            <label className="block text-gray-700 text-sm font-bold mb-2 mt-4">Additional Images (select multiple):</label>
            <input
              type="file"
              name="additionalImages"
              onChange={handleAdditionalFilesChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
              accept="image/*"
              multiple
            />
            {existingAdditionalImageUrls.length > 0 && (
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {existingAdditionalImageUrls.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Additional image ${index}`}
                      className="w-full h-24 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      onClick={() => handleRemoveAdditionalImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove this image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              name="author"
              placeholder="Author"
              value={form.author}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              name="category"
              placeholder="Category"
              value={form.category}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              className="p-3 border border-gray-200 rounded-lg w-full bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 hover:shadow-md"
            />
            <button
              onClick={handleSubmit}
              className={`py-3 px-6 rounded-lg w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg
                ${editingBlogId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>{editingBlogId ? 'Updating...' : 'Adding...'}</span>
                </div>
              ) : (
                editingBlogId ? 'Update' : 'Add'
              )}
            </button>
            {editingBlogId && (
              <button
                onClick={handleCancelEdit}
                className="bg-gray-400 text-white py-3 px-6 rounded-lg w-full mt-2 hover:bg-gray-500 transition-colors duration-200 shadow-md"
                disabled={loading}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <hr className="my-6 border-gray-200" />

          <ul className="space-y-4">
            {blogs.length === 0 && !error && !loading ? (
              <p className="text-gray-600 text-center">No blogs available</p>
            ) : (
              blogs.map((blog) => (
                <li
                  key={blog.id}
                  className="border border-gray-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-full sm:w-3/4 mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-800">{blog.title}</h3>
                    <p className="text-gray-600 text-sm">{blog.author || 'Admin'} • {blog.category || 'N/A'} • {blog.date}</p>
                    <p className="text-gray-700">{blog.description}</p>
                  </div>
                  {blog.image && (
                    <img
                      src={blog.image}
                      alt={`${blog.title} photo`}
                      className="w-24 h-24 object-cover rounded flex-shrink-0 mb-4 sm:mb-0 sm:ml-4"
                    />
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center sm:items-start">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm"
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 py-2 px-4 text-sm"
                      disabled={loading}
                    >
                      🗑 Delete
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

export default AdminBlogs;