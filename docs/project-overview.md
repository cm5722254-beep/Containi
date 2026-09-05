# ទិដ្ឋភាពទូទៅនៃគម្រោង (Project Overview)
**មុខវិជ្ជា៖** [CTN] Containers  
**ប្រធានបទ៖** Containerized E-Commerce Management System Using Docker  
**កម្រិតសិក្សា៖** ថ្នាក់បរិញ្ញាបត្រវិទ្យាសាស្ត្រកុំព្យូទ័រ (Computer Science & DevOps)

---

## ១. សេចក្តីផ្តើម (Introduction)
នៅក្នុងយុគសម័យ Cloud-Native និងទំនើបកម្មនៃកម្មវិធីកុំព្យូទ័រ បច្ចេកវិទ្យា **Containerization** បានក្លាយជាគ្រឹះដ៏សំខាន់ដែលមិនអាចខ្វះបាន។ គម្រោងនេះត្រូវបានបង្កើតឡើងសម្រាប់មុខវិជ្ជា **Containers (CTN)** ដោយផ្តោតលើការកសាង និងដាក់ឱ្យដំណើរការនូវប្រព័ន្ធពាណិជ្ជកម្មអេឡិចត្រូនិក (E-Commerce Management System) ពេញលេញមួយ ដែលបំបែកសេវាកម្មជាច្រើនឱ្យដំណើរការលើ **Docker Containers** ផ្សេងៗគ្នា (Multi-Container Architecture)។

---

## ២. បញ្ហាដែលត្រូវដោះស្រាយ (Problem Statement)
កន្លងមក ការដាក់ឱ្យដំណើរការកម្មវិធីជាលក្ខណៈ Monolithic ឬនៅលើម៉ាស៊ីនផ្ទាល់ (Bare-Metal / Traditional VM) តែងតែជួបប្រទះនូវបញ្ហាធំៗដូចជា៖
1. **"It works on my machine" Syndrome**: កម្មវិធីដំណើរការល្អលើកុំព្យូទ័ររបស់អ្នកអភិវឌ្ឍន៍ ប៉ុន្តែបរាជ័យលើ Server ដោយសារតែភាពខុសគ្នានៃ OS, បណ្ណាល័យ (Libraries), និងកំណែរបស់ Node/PostgreSQL។
2. **Resource Inefficiency & Heavy Footprint**: ការប្រើប្រាស់ Virtual Machine (VM) ច្រើន ធ្វើឱ្យខាតបង់ RAM និង CPU ដោយសារ Guest OS នីមួយៗត្រូវការទំហំធំ។
3. **Lack of Service Isolation**: ប្រសិនបើសេវាកម្មណាមួយគាំង (ឧទាហរណ៍ Database ឬ API) វាអាចធ្វើឱ្យប្រព័ន្ធទាំងមូលគាំងតាម។
4. **Complex Networking & Port Conflicts**: ការដំឡើងសេវាកម្មច្រើនលើម៉ាស៊ីនតែមួយងាយនឹងជួបការជាន់ Port គ្នា (Port collisions)។

---

## ៣. គោលបំណងនៃគម្រោង (Project Objectives)
គម្រោងនេះមានគោលបំណងបង្ហាញពីការអនុវត្តផ្ទាល់នូវគោលគំនិតស្នូលនៃមុខវិជ្ជា Containers៖
- **Containerization**: ការវេចខ្ចប់ Frontend, Backend, Database, Cache, និង Reverse Proxy ទៅក្នុង Docker Images ស្រាល និងមានសុវត្ថិភាព។
- **Multi-Stage Docker Builds**: ការកាត់បន្ថយទំហំ Image ឱ្យនៅតូចបំផុត តាមរយៈដំណាក់កាល Dependencies, Build, និង Production Runner។
- **Container Orchestration (Docker Compose)**: ការគ្រប់គ្រង ដំណើរការ និងត្រួតពិនិត្យ Lifecycle របស់ Containers ទាំង ៥ ក្នុងពេលតែមួយ។
- **Docker Custom Network (`app-network`)**: ការបង្កើតបណ្តាញដាច់ដោយឡែកមួយ ដើម្បីឱ្យ Containers ទាំងអស់ទំនាក់ទំនងគ្នាដោយស្វ័យប្រវត្តិតាមរយៈ **Service Discovery (DNS)** ដោយមិនប្រើប្រាស់ `localhost`។
- **Persistent Data Storage (Docker Named Volumes)**: ការធានាថាទិន្នន័យក្នុង PostgreSQL (`postgres_data`) និង Redis (`redis_data`) មិនបាត់បង់ទោះបីជា Container ត្រូវបាន Stop ឬ Remove ក៏ដោយ។
- **Single Public Gateway (Nginx Reverse Proxy)**: ការបើកតែ Port 80 ទៅកាន់ពិភពខាងក្រៅ ហើយលាក់បាំង Port ខាងក្នុងទាំងអស់ (`3000`, `5000`, `5432`, `6379`) ដើម្បីសុវត្ថិភាពខ្ពស់។

---

## ៤. មុខងារចម្បងរបស់ប្រព័ន្ធ (Key Features)

### ផ្នែកអតិថិជន (Customer Features)
- ចុះឈ្មោះ និងចូលប្រើប្រាស់គណនី (JWT Authentication)
- ស្វែងរក និងមើលកាតាឡុកទំនិញតាមប្រភេទ (Categories & Search)
- បន្ថែម និងកែសម្រួលទំនិញក្នុងកន្ត្រក (Cart Management)
- បញ្ជាទិញទំនិញ (Checkout & Order Creation with Transaction Rollback)
- មើលប្រវត្តិនៃការបញ្ជាទិញ (Order History)

### ផ្នែកអ្នកគ្រប់គ្រង (Admin Features)
- ផ្ទាំងគ្រប់គ្រងស្ថិតិ (Dashboard Analytics: ចំណូល, ចំនួនការកុម្ម៉ង់, ទំនិញជិតអស់ពីស្តុក)
- គ្រប់គ្រងផលិតផល (Product CRUD: បន្ថែម, កែប្រែ, លុប ដែលមានការ Invalidate Cache លើ Redis)
- គ្រប់គ្រងប្រភេទផលិតផល (Category Management)
- គ្រប់គ្រងការបញ្ជាទិញ (Update Order Status: Pending, Processing, Completed, Cancelled)
- គ្រប់គ្រងអ្នកប្រើប្រាស់ (User Management)
- **CTN Docker Live Topology Monitor**: ពិនិត្យមើលស្ថានភាពរបស់ Containers នីមួយៗ និង Memory Usage ជាក់ស្តែង។
