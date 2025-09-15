import axios from 'axios';

const BASE_URL = 'https://one-stop.ps';
// const BASE_URL = 'http://127.0.0.1:8000';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    async (config) => {
        // لا حاجة لجلب رمز CSRF لتسجيل الدخول (/api/admin/login)
        if (config.url !== '/api/admin/login' && ['post', 'put', 'delete'].includes(config.method.toLowerCase())) {
            try {
                console.log(`جاري جلب رمز CSRF من ${BASE_URL}/sanctum/csrf-cookie...`);
                await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
                console.log('تم جلب رمز CSRF بنجاح');
            } catch (error) {
                console.error('خطأ في جلب رمز CSRF:', error.response?.data || error.message);
            }
        }

        // إضافة رمز التوثيق إذا كان موجودًا
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // إزالة رأس Content-Type للطلبات التي تستخدم FormData
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        // تسجيل تفاصيل الطلب للتصحيح
        console.log(`طلب: ${config.method.toUpperCase()} ${config.url}`, {
            headers: { ...config.headers.common, ...config.headers },
            data: config.data instanceof FormData ? 'FormData' : config.data,
            withCredentials: config.withCredentials,
        });

        return config;
    },
    (error) => {
        console.error('خطأ في معترض الطلب:', error.message);
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        console.log(`استجابة: ${response.config.method.toUpperCase()} ${response.config.url} - الحالة: ${response.status}`);
        return response;
    },
    async (error) => {
        const { response, config } = error;

        // إضافة عداد لمحاولات إعادة الطلب
        config.retryCount = config.retryCount || 0;
        const maxRetries = 3;

        if (response) {
            if (response.status === 401) {
                console.warn('الوصول غير مصرح به، جاري إزالة رمز التوثيق');
                localStorage.removeItem('token');
                window.location.href = '/admin/login';
            } else if (response.status === 419 && config.url !== '/api/admin/login' && config.retryCount < maxRetries) {
                console.warn('عدم تطابق رمز CSRF أو انتهاء صلاحيته');
                try {
                    console.log(`محاولة تجديد رمز CSRF من ${BASE_URL}/sanctum/csrf-cookie... (المحاولة ${config.retryCount + 1})`);
                    await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
                    console.log('تم تجديد رمز CSRF بنجاح، جاري إعادة المحاولة');
                    config.retryCount += 1;
                    return axiosInstance(config);
                } catch (csrfError) {
                    console.error('فشل تجديد رمز CSRF:', csrfError.response?.data || csrfError.message);
                    return Promise.reject(error);
                }
            } else if (response.status === 419) {
                console.error(`تم تجاوز الحد الأقصى لمحاولات إعادة الطلب (${maxRetries})`);
                return Promise.reject(error);
            } else if (response.status === 422) {
                const errors = response.data.errors || response.data.message;
                console.error('خطأ التحقق من الصحة:', errors);
                return Promise.reject({ ...error, validationErrors: errors });
            } else if (response.status === 500) {
                console.error('خطأ الخادم:', response.data.error || response.data.message);
            }
        } else {
            console.error('خطأ في الشبكة أو خطأ غير معروف:', error.message);
        }

        return Promise.reject(error);
    }
);

export { axiosInstance };