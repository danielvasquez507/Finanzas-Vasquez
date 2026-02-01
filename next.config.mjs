/** @type {import('next').NextConfig} */
const nextConfig = {
  // Activa el modo standalone para generar una build optimizada para Docker
  // Esto reduce drásticamente el tamaño de la imagen final
  output: "standalone",
  
  // Opcional: Si usas imágenes externas en el futuro
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;