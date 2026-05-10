(function() {
    'use strict';

    console.log('UA Kino Plugin v1.4 — Фінальна версія');

    const PLUGIN_NAME = 'UA Кіно';
    const PLUGIN_VERSION = '1.4';

    function startPlugin() {
        if (window.ua_kino_plugin) return;
        window.ua_kino_plugin = true;

        Lampa.Component.add('ua_kino_main', uaKinoMain);

        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                addToMenu();
            }
        });

        addWatchOnlineButton();

        console.log(`✅ \( {PLUGIN_NAME} v \){PLUGIN_VERSION} успішно завантажено`);
    }

    function addToMenu() {
        Lampa.Catalog.add({
            title: PLUGIN_NAME,
            icon: '📺',
            onMore: function() {
                Lampa.Activity.push({
                    component: 'ua_kino_main',
                    title: PLUGIN_NAME,
                    page: 1
                });
            }
        });
    }

    // Головна сторінка плагіна
    function uaKinoMain(object) {
        let container = $('<div class="layer"></div>');
        
        let searchInput = $(`
            <input type="text" placeholder="Пошук фільмів, серіалів, аніме..." 
                   style="width:100%; padding:15px; margin:15px 0; border-radius:12px; font-size:16px;">
        `);

        let results = $('<div class="ua-results"></div>');

        searchInput.on('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                searchContent(this.value.trim());
            }
        });

        container.append(searchInput).append(results);
        object.activity.render(container);
    }

    // Пошук (заглушка)
    function searchContent(query) {
        $('.ua-results').html('<div style="text-align:center; padding:50px 20px; color:#fff;">🔍 Шукаємо...</div>');

        setTimeout(() => {
            let html = `
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:20px; padding:15px;">
                    <div class="card ua-card" data-title="Інтерстеллар (UA)" 
                         data-poster="https://image.tmdb.org/t/p/w300/8GuvF8X1Z8Z2z2z2z2z2.jpg"
                         data-url="https://test-streams.mux.dev/x264_720p_1500kbs_30fps.mp4">
                        <img src="https://image.tmdb.org/t/p/w300/8GuvF8X1Z8Z2z2z2z2z2.jpg" style="width:100%; border-radius:10px;">
                        <div style="margin-top:10px; color:#fff;">Інтерстеллар</div>
                        <div style="color:#0f0; font-size:13px;">Українська озвучка</div>
                    </div>
                </div>`;

            $('.ua-results').html(html);

            $('.ua-card').on('click', function() {
                let data = {
                    title: $(this).data('title'),
                    poster: $(this).data('poster'),
                    url: $(this).data('url')
                };
                openFullCard(data);
            });
        }, 600);
    }

    function openFullCard(data) {
        Lampa.Activity.push({
            component: 'full',
            card: {
                title: data.title,
                poster: data.poster,
                overview: 'Українська озвучка • Висока якість',
                url: data.url
            }
        });
    }

    // Кнопка "Дивитись онлайн"
    function addWatchOnlineButton() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type !== 'complite') return;

            setTimeout(tryAddButton, 600);
        });

        // Додатковий контроль
        setInterval(() => {
            if (Lampa.Activity.active()?.name === 'full') tryAddButton();
        }, 2500);
    }

    function tryAddButton() {
        const activity = Lampa.Activity.active();
        if (!activity || !activity.card || !activity.card.url) return;

        $('.full__button--watch-online').remove();

        const button = $(`
            <div class="full__button full__button--watch-online" 
                 style="background: #e50914; color: #fff; font-size: 17px; font-weight: bold; padding: 16px 0; margin: 10px 0; border-radius: 8px; text-align: center;">
                ▶ Дивитись онлайн
            </div>
        `);

        button.on('click', function() {
            Lampa.Player.play({
                title: activity.card.title,
                url: activity.card.url
            });
        });

        $('.full__buttons').prepend(button);
    }

    // Автозапуск
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') startPlugin();
    });

})();
