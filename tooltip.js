function initializeTooltip() {
    let currentTooltipEl = null;
    let currentTargetEl = null;

    const hideTooltip = () => {
        if (currentTooltipEl) {
            currentTooltipEl.remove();
            currentTooltipEl = null;
            currentTargetEl = null;
        }
    };

    const closeAllActiveTooltips = () => {
        // Sadece oluşturulmuş tooltip container'larını kaldır
        const activeTooltips = document.querySelectorAll('[data-tooltip-container]');
        activeTooltips.forEach(tooltip => {
            tooltip.remove();
        });
        
        // Ayrıca tüm tooltip sahibi elementlerin timeout'larını temizle
        const tooltipElements = document.querySelectorAll(
            '[data-alt-tooltip], [data-sag-tooltip], [data-sol-tooltip], [data-ust-tooltip], [data-tooltip]'
        );
        tooltipElements.forEach(el => {
            if (el.tooltipTimeout) {
                clearTimeout(el.tooltipTimeout);
                el.tooltipTimeout = null;
            }
        });
        
        // Global değişkenleri sıfırla
        currentTooltipEl = null;
        currentTargetEl = null;
    };

    const showTooltip = (el) => {
        // Önceki tooltip'i temizle
        hideTooltip();
        
        const tooltipText = el.dataset.altTooltip || el.dataset.sagTooltip || el.dataset.solTooltip || el.dataset.ustTooltip || el.dataset.tooltip;
        if (!tooltipText) return;

        const tooltip = document.createElement("div");
        tooltip.textContent = tooltipText;
        tooltip.className = 'tooltip'; // CSS için class ekleyelim
        tooltip.setAttribute('data-tooltip-container', '');
        document.body.appendChild(tooltip);

        const rect = el.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const offset = 8;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // AKILLI KONUMLANDIRMA FONKSİYONU
        const calculatePosition = () => {
            const positions = [
                {
                    name: 'top',
                    top: rect.top - tooltipRect.height - offset,
                    left: rect.left + (rect.width - tooltipRect.width) / 2,
                    fits: rect.top - tooltipRect.height - offset > 0,
                    priority: 1
                },
                {
                    name: 'bottom',
                    top: rect.bottom + offset,
                    left: rect.left + (rect.width - tooltipRect.width) / 2,
                    fits: rect.bottom + tooltipRect.height + offset < windowHeight,
                    priority: 2
                },
                {
                    name: 'right',
                    top: rect.top + (rect.height - tooltipRect.height) / 2,
                    left: rect.right + offset,
                    fits: rect.right + tooltipRect.width + offset < windowWidth,
                    priority: 3
                },
                {
                    name: 'left',
                    top: rect.top + (rect.height - tooltipRect.height) / 2,
                    left: rect.left - tooltipRect.width - offset,
                    fits: rect.left - tooltipRect.width - offset > 0,
                    priority: 4
                }
            ];

            // Önce özel attribute varsa onu kullan
            if (el.hasAttribute("data-alt-tooltip")) {
                return positions.find(p => p.name === 'bottom') || positions[0];
            } else if (el.hasAttribute("data-ust-tooltip")) {
                return positions.find(p => p.name === 'top') || positions[1];
            } else if (el.hasAttribute("data-sag-tooltip")) {
                return positions.find(p => p.name === 'right') || positions[2];
            } else if (el.hasAttribute("data-sol-tooltip")) {
                return positions.find(p => p.name === 'left') || positions[3];
            }

            // Akıllı konumlandırma: önce uygun pozisyonları bul
            const validPositions = positions.filter(p => p.fits);
            
            if (validPositions.length > 0) {
                // Uygun pozisyon varsa, priority'ye göre sırala
                return validPositions.sort((a, b) => a.priority - b.priority)[0];
            }

            // Hiç uygun pozisyon yoksa, en az taşanı bul
            return positions.reduce((best, current) => {
                const bestOverflow = calculateOverflow(best);
                const currentOverflow = calculateOverflow(current);
                return currentOverflow < bestOverflow ? current : best;
            });
        };

        const calculateOverflow = (pos) => {
            let overflow = 0;
            if (pos.top < 0) overflow += Math.abs(pos.top);
            if (pos.top + tooltipRect.height > windowHeight) overflow += (pos.top + tooltipRect.height - windowHeight);
            if (pos.left < 0) overflow += Math.abs(pos.left);
            if (pos.left + tooltipRect.width > windowWidth) overflow += (pos.left + tooltipRect.width - windowWidth);
            return overflow;
        };

        const position = calculatePosition();

        // Pozisyonu uygula ve sınırlara yasla
        let finalTop = position.top;
        let finalLeft = position.left;

        // Sınır kontrolleri
        if (finalTop < 0) finalTop = offset;
        if (finalTop + tooltipRect.height > windowHeight) {
            finalTop = windowHeight - tooltipRect.height - offset;
        }
        if (finalLeft < 0) finalLeft = offset;
        if (finalLeft + tooltipRect.width > windowWidth) {
            finalLeft = windowWidth - tooltipRect.width - offset;
        }

        tooltip.style.top = `${finalTop + window.scrollY}px`;
        tooltip.style.left = `${finalLeft + window.scrollX}px`;
        tooltip.style.position = 'absolute';
        tooltip.style.zIndex = '9999';
        tooltip.style.pointerEvents = 'none';

        currentTooltipEl = tooltip;
        currentTargetEl = el;
    };

    // Mouseenter event listener'ını güncelle
    document.addEventListener("mouseenter", (e) => {
        const el = e.target;
        if (el.nodeType === Node.ELEMENT_NODE && 
            el.matches("[data-alt-tooltip], [data-sag-tooltip], [data-sol-tooltip], [data-ust-tooltip], [data-tooltip]")) {
            // Eğer zaten bir tooltip varsa, önce onu temizle
            if (currentTooltipEl && currentTargetEl !== el) {
                hideTooltip();
            }
            el.tooltipTimeout = setTimeout(() => showTooltip(el), 300);
        }
    }, true);

    // Mouseleave event listener'ını güncelle
    document.addEventListener("mouseleave", (e) => {
        const el = e.target;
        
        // Eğer tooltip sahibi bir elementten çıkılıyorsa
        if (el.nodeType === Node.ELEMENT_NODE && 
            (el.hasAttribute('data-alt-tooltip') || 
             el.hasAttribute('data-sag-tooltip') || 
             el.hasAttribute('data-sol-tooltip') || 
             el.hasAttribute('data-ust-tooltip') || 
             el.hasAttribute('data-tooltip'))) {
            
            // Bu elementin timeout'unu temizle
            if (el.tooltipTimeout) {
                clearTimeout(el.tooltipTimeout);
                el.tooltipTimeout = null;
            }
            
            // Eğer bu element şu anki hedef elementse, tooltip'i kapat
            if (el === currentTargetEl) {
                hideTooltip();
            }
        }
    }, true);

    // Sayfa kaydırıldığında tooltip pozisyonunu güncelle
    window.addEventListener("scroll", () => {
        if (!currentTooltipEl || !currentTargetEl) return;

        const el = currentTargetEl;
        const tooltip = currentTooltipEl;
        const rect = el.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const offset = 8;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Hangi pozisyonda olduğunu tahmin et
        let positionName = 'bottom';
        const currentTop = parseFloat(tooltip.style.top) - window.scrollY;
        const currentLeft = parseFloat(tooltip.style.left) - window.scrollX;
        
        if (currentTop < rect.top) positionName = 'top';
        else if (currentLeft > rect.right) positionName = 'right';
        else if (currentLeft < rect.left) positionName = 'left';

        // Yeni pozisyonu hesapla
        let newTop = currentTop;
        let newLeft = currentLeft;

        switch(positionName) {
            case 'top':
                newTop = rect.top - tooltipRect.height - offset;
                newLeft = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                newTop = rect.bottom + offset;
                newLeft = rect.left + (rect.width - tooltipRect.width) / 2;
                break;
            case 'right':
                newTop = rect.top + (rect.height - tooltipRect.height) / 2;
                newLeft = rect.right + offset;
                break;
            case 'left':
                newTop = rect.top + (rect.height - tooltipRect.height) / 2;
                newLeft = rect.left - tooltipRect.width - offset;
                break;
        }

        // Sınır kontrolleri
        if (newTop < 0) newTop = offset;
        if (newTop + tooltipRect.height > windowHeight) newTop = windowHeight - tooltipRect.height - offset;
        if (newLeft < 0) newLeft = offset;
        if (newLeft + tooltipRect.width > windowWidth) newLeft = windowWidth - tooltipRect.width - offset;

        tooltip.style.top = `${newTop + window.scrollY}px`;
        tooltip.style.left = `${newLeft + window.scrollX}px`;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initializeTooltip();
});
