document.addEventListener('DOMContentLoaded', function () {
    // 탭 버튼들
    const tabs = document.querySelectorAll('#Reservation, #Wish, #Account');
    // 모든 패널
    const panels = document.querySelectorAll('.mpr-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            panels.forEach(panel => panel.classList.remove('active'));

            const targetId = 'mpr-' + tab.id;
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
    (function () {
        const btnMap = {
            'mpr-wishlist': 'wishCard',
            'mpr-alert': 'price-alert-banner'
        };
        const allSections = Object.values(btnMap).map(id => document.getElementById(id));
        const btns = Object.keys(btnMap).map(id => document.getElementById(id));

        btns.forEach(btn => {
            const targetId = btnMap[btn.id];
            btn.addEventListener('click', () => {
                allSections.forEach(sec => sec && sec.classList.remove('active'));
                const target = document.getElementById(targetId);
                if (target) target.classList.add('active');
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    })();
});