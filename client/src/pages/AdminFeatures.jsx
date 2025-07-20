// C:\Users\Lenovo\one-stop-company\client\src\pages\AdminFeatures.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminFeatures = () => {
  const [language, setLanguage] = useState('en');
  const [sectionData, setSectionData] = useState({
    id: null,
    title: '', subtitle: '', description: '',
    tab1_title: '', tab2_title: '', tab3_title: '', tab4_title: '',
    button_text: '', button_url: '', image_url: '', language: 'en'
  });
  const [features, setFeatures] = useState([]); // ستحتوي على جميع المميزات
  const [newFeature, setNewFeature] = useState({ text: '', icon: '✔️', tab_index: 0 }); // <--- إضافة tab_index
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تحديث اللغة في sectionData عندما تتغير حالة اللغة
  useEffect(() => {
    setSectionData(prev => ({ ...prev, language: language }));
  }, [language]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/features?lang=${language}`);
      if (res.data.section) {
        setSectionData(res.data.section);
        setFeatures(res.data.items); // جلب جميع المميزات
      } else {
        setSectionData({
          id: null,
          title: '', subtitle: '', description: '',
          tab1_title: '', tab2_title: '', tab3_title: '', tab4_title: '',
          button_text: '', button_url: '', image_url: '',
          language: language
        });
        setFeatures([]);
      }
    } catch (err) {
      console.error("Error fetching features data:", err);
      setError("فشل في تحميل البيانات.");
      toast.error("فشل في تحميل البيانات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [language]);

  const handleChange = e => {
    setSectionData({ ...sectionData, [e.target.name]: e.target.value });
  };

  const handleSaveSection = async () => {
    try {
      if (!sectionData.title.trim()) {
        toast.error("عنوان القسم مطلوب!");
        return;
      }

      if (sectionData.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/features/${sectionData.id}`, sectionData);
        toast.success("تم تحديث القسم بنجاح!");
      } else {
        const res = await axios.post('${import.meta.env.VITE_API_URL}/api/features', sectionData);
        setSectionData(res.data.section);
        toast.success("تم إنشاء القسم بنجاح!");
      }
      fetchData();
    } catch (err) {
      console.error("Error saving section:", err);
      const errorMessage = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : "فشل في حفظ القسم.";
      toast.error(errorMessage);
    }
  };

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('${import.meta.env.VITE_API_URL}/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSectionData({ ...sectionData, image_url: res.data.url });
      toast.success("تم رفع الصورة بنجاح!");
    } catch (err) {
      console.error("Error uploading image:", err);
      const errorMessage = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : "فشل في رفع الصورة.";
      toast.error(errorMessage);
    }
  };

  const handleAddFeature = async () => {
    if (!newFeature.text.trim()) {
      toast.warn("نص الميزة لا يمكن أن يكون فارغًا.");
      return;
    }
    if (!sectionData.id) {
      toast.error("يجب حفظ القسم أولاً قبل إضافة المميزات.");
      return;
    }

    try {
      // <--- إرسال tab_index مع الميزة
      await axios.post(`${import.meta.env.VITE_API_URL}/api/features/${sectionData.id}/item`, newFeature);
      setNewFeature({ text: '', icon: '✔️', tab_index: newFeature.tab_index }); // إعادة تهيئة للحفاظ على التاب المحدد
      fetchData();
      toast.success("تمت إضافة الميزة بنجاح!");
    } catch (err) {
      console.error("Error adding feature:", err);
      const errorMessage = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : "فشل في إضافة الميزة.";
      toast.error(errorMessage);
    }
  };

  const handleDeleteFeature = async id => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/features/item/${id}`);
      fetchData();
      toast.success("تم حذف الميزة بنجاح!");
    } catch (err) {
      console.error("Error deleting feature:", err);
      const errorMessage = err.response && err.response.data && err.response.data.error
        ? err.response.data.error
        : "فشل في حذف الميزة.";
      toast.error(errorMessage);
    }
  };

  // Titles for tabs, to be used in select input
  const tabTitles = [
    sectionData.tab1_title || "التاب 1",
    sectionData.tab2_title || "التاب 2",
    sectionData.tab3_title || "التاب 3",
    sectionData.tab4_title || "التاب 4"
  ].filter(title => title !== "التاب 1" || sectionData.tab1_title); // Show default for tab 1 if empty, others only if title exists

  // Filter features based on the selected tab for display in Admin
  const [selectedAdminTab, setSelectedAdminTab] = useState(0); // State for filtering features in admin
  const filteredAdminFeatures = features.filter(f => f.tab_index === selectedAdminTab);


  if (loading) return <div className="p-6 max-w-5xl mx-auto text-center">جاري التحميل...</div>;
  if (error) return <div className="p-6 max-w-5xl mx-auto text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">إدارة قسم "لماذا نحن؟"</h2>

      <div className="mb-4">
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
          اختر اللغة:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="border border-gray-300 p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto"
        >
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      <div className="space-y-4 mb-6">
        <input
          name="title"
          placeholder="العنوان الرئيسي"
          value={sectionData.title}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <input
          name="subtitle"
          placeholder="العنوان الفرعي"
          value={sectionData.subtitle}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <textarea
          name="description"
          placeholder="الوصف"
          value={sectionData.description}
          onChange={handleChange}
          rows="4"
          className="border border-gray-300 p-2 w-full rounded-md"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="tab1_title" placeholder="عنوان التاب 1" value={sectionData.tab1_title} onChange={handleChange} className="border border-gray-300 p-2 rounded-md" />
          <input name="tab2_title" placeholder="عنوان التاب 2" value={sectionData.tab2_title} onChange={handleChange} className="border border-gray-300 p-2 rounded-md" />
          <input name="tab3_title" placeholder="عنوان التاب 3" value={sectionData.tab3_title} onChange={handleChange} className="border border-gray-300 p-2 rounded-md" />
          <input name="tab4_title" placeholder="عنوان التاب 4" value={sectionData.tab4_title} onChange={handleChange} className="border border-gray-300 p-2 rounded-md" />
        </div>

        <input
          name="button_text"
          placeholder="نص الزر"
          value={sectionData.button_text}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        />
        <input
          name="button_url"
          placeholder="رابط الزر (مثال: /contact)"
          value={sectionData.button_url}
          onChange={handleChange}
          className="border border-gray-300 p-2 w-full rounded-md"
        />

        <div className="mb-4">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">صورة القسم:</label>
          <input
            id="image-upload"
            type="file"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
          />
          {sectionData.image_url && (
            <div className="mt-3">
              <p className="text-sm text-gray-600">الصورة الحالية:</p>
              <img src={sectionData.image_url} alt="preview" className="w-48 h-auto object-cover rounded-md border border-gray-200" />
            </div>
          )}
        </div>

        <button
          onClick={handleSaveSection}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md transition duration-300 ease-in-out shadow-md"
        >
          {sectionData.id ? '💾 حفظ التغييرات' : '✨ إنشاء القسم'}
        </button>
      </div>

      <hr className="my-8 border-t-2 border-gray-200" />

      <h3 className="text-xl font-bold mb-4 text-gray-800">إدارة المميزات</h3>

      {/* Select Tab for adding/viewing features */}
      <div className="mb-4">
        <label htmlFor="feature-tab-select" className="block text-sm font-medium text-gray-700 mb-1">
          اختر التاب للميزة:
        </label>
        <select
          id="feature-tab-select"
          value={newFeature.tab_index}
          onChange={e => setNewFeature({ ...newFeature, tab_index: parseInt(e.target.value) })}
          className="border border-gray-300 p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto"
        >
          {tabTitles.map((title, index) => (
            <option key={index} value={index}>
              {title}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 mb-6">
        <input
          placeholder="أيقونة (مثال: ✔️)"
          value={newFeature.icon}
          onChange={e => setNewFeature({ ...newFeature, icon: e.target.value })}
          className="border border-gray-300 p-2 rounded-md w-full md:w-24"
        />
        <input
          placeholder="نص الميزة"
          value={newFeature.text}
          onChange={e => setNewFeature({ ...newFeature, text: e.target.value })}
          className="border border-gray-300 p-2 rounded-md flex-1"
        />
        <button
          onClick={handleAddFeature}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-md transition duration-300 ease-in-out shadow-md"
        >
          ➕ إضافة ميزة
        </button>
      </div>

      {/* Display features filtered by selected admin tab */}
      <div className="mb-4">
        <label htmlFor="view-features-tab-select" className="block text-sm font-medium text-gray-700 mb-1">
          عرض مميزات التاب:
        </label>
        <select
          id="view-features-tab-select"
          value={selectedAdminTab}
          onChange={e => setSelectedAdminTab(parseInt(e.target.value))}
          className="border border-gray-300 p-2 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:w-auto"
        >
          {tabTitles.map((title, index) => (
            <option key={index} value={index}>
              {title}
            </option>
          ))}
        </select>
      </div>

      {filteredAdminFeatures.length > 0 ? (
        <ul className="space-y-3">
          {filteredAdminFeatures.map(f => (
            <li key={f.id} className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-md shadow-sm">
              <span className="text-gray-700">
                <span className="font-bold text-lg mr-2">{f.icon}</span>
                {f.text}
              </span>
              <button
                onClick={() => handleDeleteFeature(f.id)}
                className="text-red-600 hover:text-red-800 transition duration-300 ease-in-out p-1 rounded-full hover:bg-red-100"
                title="حذف الميزة"
              >
                🗑
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 italic">لا توجد مميزات مضافة لهذا التاب بعد.</p>
      )}
    </div>
  );
};

export default AdminFeatures;