# 🐼 Numa — Landing Page

## Subir a GitHub

```bash
# 1. Descomprimí el archivo
tar -xzf numa-landing-railway.tar.gz
cd numa-landing

# 2. Creá el repo en GitHub (desde github.com > New Repository)
#    Nombre sugerido: numa-landing

# 3. Subí el código
git init
git add .
git commit -m "Numa landing page"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/numa-landing.git
git push -u origin main
```

## Deploy en Railway

1. Entrá a [railway.app](https://railway.app)
2. **New Project** → **Deploy from GitHub repo**
3. Seleccioná el repo `numa-landing`
4. Railway detecta automáticamente que es un proyecto Node.js
5. Esperá que termine el build (~1 minuto)
6. En **Settings** → **Networking** → **Generate Domain**
7. Listo — te da un link tipo `numa-landing-production.up.railway.app`

Ese link se lo pasás a cualquiera y ve la landing page completa.

## Desarrollo local (opcional)

```bash
npm install
npm run dev
# Abre http://localhost:3000
```
