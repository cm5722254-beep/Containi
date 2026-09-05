# ការគ្រប់គ្រងទិន្នន័យអចិន្ត្រៃយ៍ និង Volumes (Docker Volumes)

មុខវិជ្ជា៖ **[CTN] Containers**

ឯកសារនេះពន្យល់អំពីភាពខុសគ្នារវាង **Container Filesystem** និង **Docker Volumes** ព្រមទាំងសារៈសំខាន់នៃការរក្សាទុកទិន្នន័យ (Data Persistence)។

---

## ១. ភាពខុសគ្នារវាង Container Filesystem និង Docker Volume

```
+-------------------------------------------------------------+
|                      Container                              |
|   +-----------------------------------------------------+   |
|   |         Read-Write Layer (Ephemeral Layer)          |   |
|   |   (បាត់បង់ទិន្នន័យភ្លាមៗពេល Container ត្រូវ Remove)    |   |
|   +-----------------------------------------------------+   |
|   |         Image Layers (Read-Only)                    |   |
+-------------------------------------------------------------+
                                |
                   (Mounted / Bypass Ephemeral)
                                ↓
+-------------------------------------------------------------+
|               Docker Named Volume (postgres_data)           |
|      (រក្សាទុកនៅលើ Host Disk ឯករាជ្យពី Container Lifecycle)    |
+-------------------------------------------------------------+
```

### ក. Container Ephemeral Writable Layer (ការផ្ទុកទិន្នន័យបណ្តោះអាសន្ន)
- រាល់ពេលដែល Container ត្រូវបានបង្កើត Docker នឹងបន្ថែម **Writable Layer** ស្តើងមួយពីលើ Image Layers។
- ប្រសិនបើយើងរក្សាទុកទិន្នន័យ Database នៅក្នុង Layer នេះ៖
  - នៅពេលយើង Stop Container: ទិន្នន័យនៅមាន។
  - **នៅពេលយើង Remove Container (`docker compose down` ឬ `docker rm`)**: Writable Layer នឹងត្រូវលុបចោលទាំងស្រុង។ **ទិន្នន័យ Database ទាំងអស់នឹងបាត់បង់ 100% មិនអាចស្រោចស្រង់បានឡើយ!**

### ខ. Docker Named Volume (`postgres_data`)
- Docker Volume គឺជា Directory ពិសេសមួយដែលត្រូវបានបង្កើត និងគ្រប់គ្រងដោយផ្ទាល់ដោយ Docker Engine នៅលើ Host Filesystem (ឧទាហរណ៍ `/var/lib/docker/volumes/postgres_data/_data`)។
- **ឯករាជ្យពី Container Lifecycle**: ទោះបីជា Container ត្រូវបានលុបចោល បង្កើតថ្មី ឬ Upgrade Version ក៏ទិន្នន័យនៅក្នុង Volume មិនរងផលប៉ះពាល់ឡើយ។
- នៅពេល Container ថ្មីចាប់ផ្តើម ហើយ Mount ទៅកាន់ Volume ដដែលនោះ វានឹងទាញយកទិន្នន័យចាស់ទាំងអស់មកវិញភ្លាមៗ។

---

## ២. Bind Mounts ទល់នឹង Named Volumes

| លក្ខណៈ | Docker Named Volume | Bind Mount |
|---|---|---|
| **ឧទាហរណ៍ក្នុងគម្រោង** | `postgres_data:/var/lib/postgresql/data` | `./database/init.sql:/docker-entrypoint-initdb.d/init.sql` |
| **ការគ្រប់គ្រង** | គ្រប់គ្រងដោយ Docker ទាំងស្រុង | ភ្ជាប់ទៅកាន់ Folder ជាក់លាក់របស់ Developer |
| **ករណីប្រើប្រាស់** | ស័ក្តិសមសម្រាប់ Production Database, Redis Cache | ស័ក្តិសមសម្រាប់ Configuration Files, Source Code (Dev Mode) |
| **Performance** | ល្បឿនលឿន (Native I/O) | អាចយឺតជាងបន្តិចលើ Windows/macOS |

---

## ៣. ការបង្ហាញអំពី Persistence ជូនសាស្ត្រាចារ្យ (Demo Steps)

ដើម្បីបញ្ជាក់ថាប្រព័ន្ធនេះប្រើប្រាស់ Volume ពិតប្រាកដ សូមអនុវត្តដូចខាងក្រោម៖
1. បង្កើតផលិតផលថ្មីមួយពី Web UI ឬ Admin Dashboard (ឧទាហរណ៍៖ "MacBook Air M3")។
2. បិទ និងលុប Containers ទាំងអស់ចោល៖
   ```bash
   docker compose down
   ```
   *(ចំណាំ៖ កុំប្រើ Flag `-v` ព្រោះ `-v` នឹងលុប Volume ចោល)*
3. បើកប្រព័ន្ធឡើងវិញ៖
   ```bash
   docker compose up -d
   ```
4. ចូលទៅកាន់ Web UI ម្តងទៀត៖
   - អ្នកនឹងឃើញថាផលិតផល "MacBook Air M3" នៅមានវត្តមានដដែល!
   - នេះជាភស្តុតាងជាក់ស្តែងដែលបញ្ជាក់ថាទិន្នន័យត្រូវបានរក្សាទុកក្នុង Docker Volume `postgres_data` ដោយជោគជ័យ។

---

## ៤. ពាក្យបញ្ជាគ្រប់គ្រង Docker Volume
- បង្ហាញបញ្ជី Volumes ទាំងអស់៖
  ```bash
  docker volume ls
  ```
- ពិនិត្យមើលព័ត៌មានលម្អិតនៃ Volume៖
  ```bash
  docker volume inspect postgres_data
  ```
- លុប Volume (លុបទិន្នន័យចោលទាំងអស់ - ប្រយ័ត្ន!):
  ```bash
  docker compose down -v
  ```
