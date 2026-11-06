# Estágio 1: Construir o React (Node 20)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# A MÁGICA: Bypassa o TypeScript (tsc) e constrói direto!
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npx vite build

# Estágio 2: Servidor Web (Nginx) super leve para rodar o site
FROM nginx:alpine
# Copia os arquivos prontos do React para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Expõe a porta 80 (padrão de sites)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
