# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# 의존성 먼저 설치 (캐시 활용)
COPY package*.json ./
RUN npm ci --omit=dev

# 소스 복사
COPY . .

# 앱이 3000 포트를 사용한다고 가정
EXPOSE 3000

# JSON 파일이 없을 수 있으니 런타임에 생성되도록 앱이 처리하면 가장 좋고,
# 앱이 없으면 entrypoint에서 생성해도 됩니다. (옵션)
CMD ["npm", "start"]
