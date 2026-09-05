# បណ្តាញ និងការប្រាស្រ័យទាក់ទងក្នុង Docker (Docker Networking)

មុខវិជ្ជា៖ **[CTN] Containers**

ឯកសារនេះពន្យល់អំពីយន្តការបណ្តាញ (Networking) នៅក្នុង Docker និងមូលហេតុដែលមិនត្រូវប្រើ `localhost` រវាង Containers ផ្សេងគ្នា។

---

## ១. ប្រភេទបណ្តាញរបស់ Docker (Network Drivers)

Docker គាំទ្រ Network Drivers ជាច្រើនដូចជា៖
1. **Bridge Network (លំនាំដើម)**: បង្កើត Virtual Switch នៅលើ Host ដើម្បីឱ្យ Containers លើម៉ាស៊ីនតែមួយអាចទំនាក់ទំនងគ្នាបាន។
2. **Host Network**: យក Network Stack របស់ Host ផ្ទាល់ (គ្មាន Isolation)។
3. **Overlay Network**: ប្រើសម្រាប់ភ្ជាប់ Containers ឆ្លងកាត់ម៉ាស៊ីន Physical ច្រើន (Docker Swarm / Kubernetes)។
4. **None**: បិទរាល់ Network ទាំងអស់លើ Container (Isolated 100%)។

នៅក្នុងគម្រោងនេះ យើងប្រើប្រាស់ **User-Defined Bridge Network (`app-network`)**។

---

## ២. មូលហេតុដែលត្រូវប្រើ User-Defined Bridge Network

ភាពខុសគ្នារវាង **Default Bridge** និង **User-Defined Bridge**៖
- **Default Bridge Network** (`docker0`): មិនគាំទ្រ Automatic DNS Service Discovery ឡើយ។ ប្រសិនបើចង់តភ្ជាប់ អ្នកត្រូវចាំ IP Address ជាក់លាក់របស់ Container ដែល IP នេះអាចប្រែប្រួលរាល់ពេល Restart។
- **User-Defined Bridge Network** (`app-network`): Docker Engine បើកដំណើរការ **Embedded DNS Server** (IP `127.0.0.11`) ដោយស្វ័យប្រវត្តិ។ Containers ទាំងអស់អាចហៅគ្នាទៅវិញទៅមកតាមរយៈ **Service Name** (ឧទាហរណ៍ `postgres`, `redis`, `backend`, `frontend`) ដោយមិនចាំបាច់ខ្វល់ពី IP Address ឡើយ!

---

## ៣. ហេតុអ្វីបានជា `localhost` មិនអាចប្រើរវាង Container ផ្សេងគ្នាបាន?

> [!CAUTION]
> **សំណួរប្រឡង និងការពារគម្រោង CTN ដ៏សំខាន់បំផុត (CTN Defense Question):**
> "ហេតុអ្វីបានជា Backend មិនអាចភ្ជាប់ទៅកាន់ Database ដោយប្រើ `localhost:5432` បាន?"

### ការបកស្រាយបច្ចេកទេស (Technical Explanation):
1. **Network Namespace Isolation**:
   - Container នីមួយៗមាន **Linux Network Namespace** ដាច់ដោយឡែកពីគ្នា។
   - នៅក្នុង Backend Container ពាក្យថា `localhost` ឬ `127.0.0.1` សំដៅលើ **Loopback Interface (`lo`)** របស់ *Backend Container ផ្ទាល់ខ្លួនឯងប៉ុណ្ណោះ*។
   - វាមិនសំដៅលើ Host Machine ហើយក៏មិនសំដៅលើ Database Container ដែរ។
2. **ផលវិបាកនៃការប្រើ `localhost`**:
   - ប្រសិនបើ Backend ព្យាយាមភ្ជាប់ទៅ `localhost:5432` Backend នឹងស្វែងរក PostgreSQL Process នៅក្នុង Container របស់វាផ្ទាល់។ ដោយសារតែក្នុង Backend Container គ្មានដំឡើង PostgreSQL វានឹងចេញកំហុសភ្លាមៗថា៖
     `ECONNREFUSED 127.0.0.1:5432`
3. **ដំណោះស្រាយត្រឹមត្រូវ**:
   - ត្រូវភ្ជាប់ទៅកាន់ **Service Name**:
     `postgresql://admin:password@postgres:5432/ecommerce`
   - Docker Embedded DNS នឹងបកប្រែពាក្យ `postgres` ទៅជា IP Address របស់ Database Container ក្នុងបណ្តាញ `app-network` ដោយស្វ័យប្រវត្តិ។

---

## ៤. របៀបដែល Nginx ធ្វើ Reverse Proxy ដោយប្រើ Service Discovery

នៅក្នុង `nginx/nginx.conf`:
```nginx
upstream frontend_upstream {
    server frontend:3000;
}

upstream backend_upstream {
    server backend:5000;
}
```
- នៅពេលមាន Request ចូលមក `http://localhost/` Nginx នឹងបញ្ជូនទៅ `frontend:3000`។
- នៅពេលមាន Request ចូលមក `http://localhost/api/` Nginx នឹងបញ្ជូនទៅ `backend:5000`។
- ឈ្មោះ `frontend` និង `backend` ត្រូវបាន Resolve ដោយ DNS របស់ Docker។

---

## ៥. របៀប Inspect មើលបណ្តាញ Docker

ដើម្បីបង្ហាញសាស្ត្រាចារ្យ សូមដំណើរការពាក្យបញ្ជា៖
```bash
docker network ls
docker network inspect app-network
```
អ្នកនឹងឃើញបញ្ជី Containers ទាំងអស់ (nginx, frontend, backend, postgres, redis) ស្ថិតនៅក្នុង Subnet តែមួយ (ឧទាហរណ៍ `172.20.0.0/16`) ជាមួយ IPv4 Address ជាក់លាក់របស់វា។
