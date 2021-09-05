const Profile = () => import(/* webpackChunkName:'profile' */ '@/views/Profile.vue')

export default [
  {
    path: '/rmrk/u/:id',
    name: 'profile',
    component: Profile,
  }
];
