import { useUserStore } from '@/stores/userStore';
import { createRouter, createWebHistory } from 'vue-router';

// Auth views
const LoginView = () => import('@/views/auth/LoginView.vue');
const RegisterView = () => import('@/views/auth/RegisterView.vue');
const ProfileView = () => import('@/views/auth/ProfileView.vue');
const CreateManagerView = () => import('@/views/auth/CreateManagerView.vue');

// Client views (доступны без авторизации)
const RoomsView = () => import('@/views/client/RoomsView.vue');
const RoomDetailView = () => import('@/views/client/RoomDetailView.vue');
const BookingView = () => import('@/views/client/BookingView.vue');
const MyReservationsView = () =>
  import('@/views/client/MyReservationsView.vue');

// Admin views
const AdminDashboardView = () => import('@/views/admin/AdminDashboardView.vue');
const AdminRoomsView = () => import('@/views/admin/AdminRoomsView.vue');
const AdminReservationsView = () =>
  import('@/views/admin/AdminReservationsView.vue');
const AdminReportsView = () => import('@/views/admin/AdminReportsView.vue');
const AdminUsersView = () => import('@/views/admin/AdminUsersView.vue');
const AdminAmenitiesView = () => import('@/views/admin/AdminAmenitiesView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ======================== PUBLIC ========================
    { path: '/', redirect: '/rooms' },
    {
      path: '/rooms',
      name: 'rooms',
      component: RoomsView,
    },
    {
      path: '/rooms/:id',
      name: 'room-detail',
      component: RoomDetailView,
    },

    // ======================== AUTH ========================
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    {
      path: '/profile',
      component: ProfileView,
      meta: { requiresAuth: true },
    },

    // ======================== CLIENT (требуют авторизации) ========================
    {
      path: '/booking/:roomId',
      name: 'booking',
      component: BookingView,
      meta: { requiresAuth: true, guestOnly: true },
    },
    {
      path: '/my-reservations',
      name: 'my-reservations',
      component: MyReservationsView,
      meta: { requiresAuth: true, guestOnly: true },
    },

    // ======================== ADMIN (staff) ========================
    {
      path: '/admin',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin/dashboard',
      component: AdminDashboardView,
      meta: { requiresAuth: true, staffOnly: true },
    },
    {
      path: '/admin/rooms',
      component: AdminRoomsView,
      meta: { requiresAuth: true, staffOnly: true },
    },
    {
      path: '/admin/reservations',
      component: AdminReservationsView,
      meta: { requiresAuth: true, staffOnly: true },
    },
    {
      path: '/admin/reports',
      component: AdminReportsView,
      meta: { requiresAuth: true, staffOnly: true },
    },
    {
      path: '/admin/users',
      component: AdminUsersView,
      meta: { requiresAuth: true, staffOnly: true },
    },
    {
      path: '/admin/amenities',
      component: AdminAmenitiesView,
      meta: { requiresAuth: true, adminOnly: true },
    },
    {
      path: '/admin/create-manager',
      component: CreateManagerView,
      meta: { requiresAuth: true, adminOnly: true },
    },

    // ======================== 404 ========================
    {
      path: '/:pathMatch(.*)*',
      redirect: '/rooms',
    },
  ],
});

// ======================== GUARDS ========================
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const userStore = useUserStore();

  // Загрузка пользователя если есть токен но нет данных
  if (token && !userStore.user) {
    try {
      const client = (await import('@/api/client')).default;
      const res = await client.get('/auth/me');
      userStore.setUser(res.data);
    } catch {
      userStore.clear();
      if (to.meta.requiresAuth) {
        return next('/login');
      }
    }
  }

  const role = userStore.user?.roleType?.name;
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isStaff = isAdmin || isManager;

  // Требуется авторизация
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  // Staff-only маршруты — только админ и менеджер
  if (to.meta.staffOnly && !isStaff) {
    return next('/rooms');
  }

  // Admin-only маршруты
  if (to.meta.adminOnly && !isAdmin) {
    return next('/admin/dashboard');
  }

  // Guest-only маршруты — админ и менеджер не могут бронировать как гость
  if (to.meta.guestOnly && isStaff) {
    return next('/admin/dashboard');
  }

  next();
});

export default router;
