// КОНФИГУРАЦИЯ ОБЛАКА
const SB_URL = 'grsszunlfmehyykkvccj';
const SB_KEY = 'ZTEGCDF4981E';
const supabase = (SB_URL.includes('your-project')) ? null : supabase.createClient(SB_URL, SB_KEY);

document.addEventListener('alpine:init', () => {
    Alpine.data('artelCore', () => ({
        page: 1,
        theme: localStorage.getItem('artel_theme') || 'theme-classic',
        online: navigator.onLine,
        myId: localStorage.getItem('artel_id') || 'ART-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        username: localStorage.getItem('artel_user') || 'Инженер-' + Math.floor(Math.random() * 99),
        
        msg: '',
        messages: [],
        inventory: [],
        
        hasNotice: false,
        obdQuery: '',
        navIcons: ['home', 'message-circle', 'package', 'wrench', 'zap', 'brain-circuit', 'laugh', 'settings'],

        // Данные Артели
        zapovedi: ["ТБ — не догма, а рекомендация.", "Закон лишней детали — оптимизация веса.", "Синяя изолента лечит всё.", "Инструмент — святое.", "Мат — ускоритель процесса.", "«На глазок» — точнейший прибор.", "Не крутится — бери рычаг больше.", "Обмыл — значит, закрепил."],
        rezba: [{m:'M6', s:'1.0', d:'5.0'}, {m:'M8', s:'1.25', d:'6.8'}, {m:'M10', s:'1.5', d:'8.5'}],
        themes: [{name:'Изолента', val:'theme-classic', color:'#003399'}, {name:'Мазут', val:'theme-oil', color:'#1a1a1a'}, {name:'Ржавчина', val:'theme-rust', color:'#7c2d12'}],

        async init() {
            lucide.createIcons();
            document.body.className = this.theme;
            this.generateQR();

            // 1. Загрузка данных из облака
            await this.fetchCloudData();

            // 2. Подписка на Realtime (Облачная синхронизация)
            if (supabase) {
                supabase.channel('artel-live')
                    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'artel_messages' }, payload => {
                        this.messages.push(payload.new);
                        if (payload.new.user_id !== this.myId) this.hasNotice = true;
                    })
                    .on('postgres_changes', { event: '*', schema: 'public', table: 'artel_inventory' }, () => {
                        this.fetchInventory();
                    })
                    .subscribe();
            }

            window.addEventListener('online', () => this.online = true);
            window.addEventListener('offline', () => this.online = false);
        },

        async fetchCloudData() {
            if (!supabase) return;
            // Грузим сообщения
            const { data: msgs } = await supabase.from('artel_messages').select('*').order('created_at', { ascending: true }).limit(50);
            if (msgs) this.messages = msgs;
            // Грузим склад
            this.fetchInventory();
        },

        async fetchInventory() {
            if (!supabase) return;
            const { data } = await supabase.from('artel_inventory').select('*').order('created_at', { ascending: false });
            if (data) this.inventory = data;
        },

        async sendMsg() {
            if (!this.msg.trim()) return;
            const newMsg = { text: this.msg, user_id: this.myId, username: this.username };
            
            if (supabase) {
                await supabase.from('artel_messages').insert([newMsg]);
            } else {
                this.messages.push(newMsg); // Локальный режим
            }

            this.msg = '';
            setTimeout(() => { document.getElementById('pusker').checked = false; }, 300);
        },

        async addToInventory(name) {
            if (!name || !supabase) return;
            await supabase.from('artel_inventory').insert([{ item_name: name, owner_id: this.myId }]);
        },

        generateQR() {
            const qr = qrcode(0, 'M');
            qr.addData(window.location.href);
            qr.make();
            const el = document.getElementById('qrcode');
            if (el) el.innerHTML = qr.createImgTag(4);
        },

        scanOBD() {
            const codes = {"P0101":"ДМРВ ошибка.","P0300":"Пропуски зажигания."};
            return codes[this.obdQuery.toUpperCase()] || "КОД НЕ НАЙДЕН. МОТАЙ ИЗОЛЕНТУ.";
        }
    }));
});
