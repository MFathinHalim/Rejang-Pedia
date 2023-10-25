FROM node:slim
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 1945
CMD node index.js