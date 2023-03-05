export default {
  create: process.env.NODE_ENV === 'production' ? false : true,
  update: false,
  prefix: process.env.NODE_ENV === 'test' ? 'test-' : '',
};
