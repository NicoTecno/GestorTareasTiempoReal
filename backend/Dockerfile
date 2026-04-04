#Estructura y comandos del Dockerfile
#Instrucción    Qué hace
#FROM    Define la imagen base (punto de partida)
#WORKDIR    Establece el directorio de trabajo dentro del contenedor
#COPY    Copia archivos desde el host al contenedor
#RUN    Ejecuta un comando durante la construcción de la imagen
#ENV    Define variables de entorno
#CMD    Comando que se ejecuta cuando arranca el contenedor

FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]


#Comandos Docker by Rami

#Docker build -t nombre-de-la-imagen .  #Construye la imagen desde el Dockerfile
#Docker run -p puerto-local:puerto-contenedor nombre-de-la-imagen  #Ejecuta un contenedor a partir de la imagen, mapeando puertos


#docker compose up PARA LEVANTAR