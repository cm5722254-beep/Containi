# ស្ថាបត្យកម្ម Docker Container និង Service Isolation (Docker Architecture)

មុខវិជ្ជា៖ **[CTN] Containers**

ឯកសារនេះពន្យល់អំពីស្ថាបត្យកម្មនៃ Containers ទាំង ៥ ដែលត្រូវដំណើរការ ព្រមទាំងគោលការណ៍ **Service Isolation** និង **Port Security**។

---

## ១. បញ្ជី Container ទាំង ៥ និងតួនាទី

| Container Name | Service Name | Base Image | Internal Port | Host Port (Public) | Volume / Storage |
|---|---|---|---|---|---|
| **ctn_nginx** | `nginx` | `nginx:1.25-alpine` | `80` | **`80:80`** | N/A (Config mount) |
| **ctn_frontend** | `frontend` | `node:20-alpine` | `3000` | *None* (Hidden) | Ephemeral |
| **ctn_backend** | `backend` | `node:20-alpine` | `5000` | *None* (Hidden) | Ephemeral |
| **ctn_postgres** | `postgres` | `postgres:16-alpine`| `5432` | *None* (Hidden) | `postgres_data` (Named Volume) |
| **ctn_redis** | `redis` | `redis:7-alpine` | `6379` | *None* (Hidden) | `redis_data` (Named Volume) |

---

## ២. គោលការណ៍ Service Isolation (ភាពដាច់ដោយឡែកនៃសេវាកម្ម)

នៅក្នុងប្រព័ន្ធប្រពៃណី សេវាកម្មទាំងអស់ដំណើរការលើ OS តែមួយ និងចែករំលែក Resource ជាមួយគ្នា។ ប្រសិនបើសេវាកម្មមួយស៊ី RAM ឬ CPU ខ្លាំង វានឹងធ្វើឱ្យប៉ះពាល់ដល់សេវាកម្មផ្សេងទៀត។

នៅក្នុង Docker Container Architecture របស់យើង៖
1. **Process Isolation (Linux Namespaces)**:
   - **PID Namespace**: ដំណើរការនីមួយៗក្នុង Container មើលឃើញតែ Process ផ្ទាល់ខ្លួនរបស់វាប៉ុណ្ណោះ (ឧទាហរណ៍ `node` ដំណើរការជា PID 1 ក្នុង Backend Container) ដោយមិនអាចមើលឃើញ Process របស់ Host ឬ Postgres ឡើយ។
   - **NET Namespace**: Container នីមួយៗមាន Virtual Network Interface, Routing Table, និង IP Address ដាច់ដោយឡែក។
   - **MNT (Mount) Namespace**: File System របស់ Container នីមួយៗត្រូវបានបំបែកដាច់ពីគ្នា។ Frontend មិនអាចអាន File របស់ Database បានឡើយ។
2. **Resource Limitation (Cgroups)**:
   - Docker អនុញ្ញាតឱ្យកំណត់កម្រិតប្រើប្រាស់ Memory និង CPU សម្រាប់ Container នីមួយៗ ការពារកុំឱ្យ Service មួយធ្វើឱ្យម៉ាស៊ីនគាំង។

---

## ៣. Port Mapping (`ports`) ទល់នឹង Port Expose (`expose`)

នេះជាចំណុចសំខាន់បំផុតដែលត្រូវពន្យល់ជូនសាស្ត្រាចារ្យមុខវិជ្ជា Containers៖

### `ports: - "80:80"` (Port Publishing/Mapping)
- មានតែ **Nginx** តែមួយគត់ដែលប្រើប្រាស់ `ports`។
- វាធ្វើការ Bind Port 80 របស់ Host ទៅកាន់ Port 80 របស់ Nginx Container។
- អតិថិជនពីខាងក្រៅអាចចូលមកបានតែតាមរយៈច្រកនេះមួយគត់ (`http://localhost`)។

### `expose: - "3000"` និង `expose: - "5000"` (Internal Exposure)
- **Frontend, Backend, Postgres, និង Redis** មិនប្រើប្រាស់ `ports` នៅលើ Host ឡើយ!
- ការប្រើ `expose` គ្រាន់តែជាការប្រកាសប្រាប់សេវាកម្មដទៃទៀតនៅក្នុង **Docker Network** តែប៉ុណ្ណោះ។
- **អត្ថប្រយោជន៍សន្តិសុខ (Security Benefit)**: គ្មាននរណាម្នាក់ពីខាងក្រៅអាច Hack ឬ Connect ផ្ទាល់ទៅកាន់ Port 5432 របស់ Database ឬ Port 6379 របស់ Redis បានឡើយ ពីព្រោះ Port ទាំងនេះមិនត្រូវបាន Publish លើ Host Interface នោះទេ។

---

## ៤. គោលការណ៍ Restart Policies (`restart: unless-stopped`)
រាល់សេវាកម្មទាំងអស់ត្រូវបានកំណត់ `restart: unless-stopped`៖
- ប្រសិនបើសេវាកម្មណាមួយគាំង (Crash) ដោយសារកំហុស ឬ Out of Memory Docker Daemon នឹង Restart សេវាកម្មនោះឡើងវិញដោយស្វ័យប្រវត្ត។
- ប្រសិនបើ Host Machine ត្រូវបាន Restart ក៏ Docker នឹងបើក Containers ទាំងអស់ឡើងវិញដោយស្វ័យប្រវត្តិដែរ។
