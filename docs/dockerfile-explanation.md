# ការពន្យល់អំពី Dockerfile និង Multi-Stage Builds (Dockerfile Explanation)

មុខវិជ្ជា៖ **[CTN] Containers**

ឯកសារនេះពន្យល់លម្អិតអំពីបច្ចេកទេស **Multi-Stage Docker Build** ដែលត្រូវបានប្រើប្រាស់ក្នុងគម្រោងនេះ ដើម្បីកាត់បន្ថយទំហំ Image និងបង្កើនសុវត្ថិភាព។

---

## ១. ហេតុអ្វីបានជាត្រូវប្រើ Multi-Stage Docker Builds?

កាលពីមុន (Single-stage Dockerfile)៖
- យើងត្រូវដំឡើងឧបករណ៍ Build ជាច្រើនដូចជា TypeScript Compiler, Python, C++ Build Tools, DevDependencies ទាំងអស់នៅក្នុង Image តែមួយ។
- លទ្ធផល៖ Docker Image មានទំហំធំខ្លាំង (អាចឡើងដល់ 1.5GB ទៅ 2GB) ដែលស៊ីទំហំ Disk យឺតពេលទាញយក (Pull/Push) និងបង្កហានិភ័យសុវត្ថិភាព (Security Vulnerabilities) ព្រោះមានកញ្ចប់កូដដែលមិនចាំបាច់ច្រើនពេក។

**ដំណោះស្រាយជាមួយ Multi-Stage Builds**៖
- បំបែកការងារជាដំណាក់កាលផ្សេងៗគ្នា (Stages)៖
  1. **Dependencies Stage**: ដំឡើងតែ Package Manifests
  2. **Build Stage**: ច្របាច់បញ្ចូល Source Code និងធ្វើការ Compile (TypeScript -> JavaScript)
  3. **Production Runner Stage**: យកតែ File ដែល Compile រួច (`dist/` ឬ `.next/standalone`) មកដំណើរការលើ Base Image ស្អាតស្អំ (Clean Alpine)។
- **លទ្ធផល**៖ ទំហំ Image ចុងក្រោយសល់ត្រឹមតែ **~120MB - 180MB** ប៉ុណ្ណោះ!

---

## ២. ការពន្យល់ Backend Dockerfile មួយជំហានម្តងៗ

```dockerfile
# ------------------------------------------
# Stage 1: Dependencies (deps)
# ------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
# ដំឡើង libc6-compat សម្រាប់ library ណាដែលត្រូវការ glibc
RUN apk add --no-cache libc6-compat
# Copy តែ package.json និង package-lock.json ដើម្បីទាញយកប្រយោជន៍ពី Docker Layer Caching
COPY package.json package-lock.json* ./
RUN npm install
```
> **គន្លឹះស្រាវជ្រាវ (Docker Layer Caching)**: ដរាបណា `package.json` មិនផ្លាស់ប្តូរ Docker នឹងប្រើ Cache នៃ Layer នេះ ធ្វើឱ្យការ Build លើកក្រោយៗចំណាយពេលត្រឹមតែប៉ុន្មានវិនាទីប៉ុណ្ណោះ!

```dockerfile
# ------------------------------------------
# Stage 2: Builder (builder)
# ------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

# Compile TypeScript ទៅជា Production JavaScript នៅក្នុង folder dist/
RUN npm run build

# ដក devDependencies ចេញ (ដូចជា @types, nodemon, ts-node)
RUN npm prune --production
```

```dockerfile
# ------------------------------------------
# Stage 3: Production Runner (runner)
# ------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# ដំឡើង curl សម្រាប់ health check របស់ Docker
RUN apk add --no-cache curl

# គោលការណ៍ Least Privilege: ប្រើប្រាស់ non-root user 'node'
USER node

# Copy តែ dist និង production node_modules ពី builder stage
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 5000

# Health check ត្រួតពិនិត្យភាពរស់រវើកនៃ Container
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

CMD ["node", "dist/index.js"]
```

---

## ៣. ការពន្យល់ Frontend Dockerfile (Next.js Standalone)

នៅក្នុង `next.config.js` យើងបានកំណត់ `output: 'standalone'`៖
- Next.js នឹងធ្វើការវិភាគ Tracing ស្វែងរកតែ File ណាដែលត្រូវប្រើពិតប្រាកដក្នុង Runtime ហើយបង្កើត Folder `.next/standalone/`។
- នៅក្នុង Runner Stage យើងគ្រាន់តែ Copy:
  1. `public` (រូបភាព Static)
  2. `.next/standalone` (Node server តូចមួយ)
  3. `.next/static` (CSS និង Client JS)
- មិនបាច់ Copy `node_modules` ទាំងមូលឡើយ!
- ដំណើរការដោយ Non-root user `nextjs:nodejs` ដើម្បីធានាសុវត្ថិភាពខ្ពស់បំផុត។

---

## ៤. ការពន្យល់ Nginx Dockerfile

```dockerfile
FROM nginx:1.25-alpine
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/nginx-health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```
- ប្រើ Base Image `alpine` ដែលមានទំហំត្រឹមតែ **~23MB** ប៉ុណ្ណោះ។
- បញ្ជា `daemon off;` ដើម្បីឱ្យ Nginx ដំណើរការជា Foreground Process (PID 1) នៅក្នុង Container ការពារកុំឱ្យ Container បិទខ្លួនឯង (Exit)។
