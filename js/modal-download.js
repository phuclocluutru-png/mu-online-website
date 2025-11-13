// Modal functionality for download modal
const initDownloadModal = () => {
    const modal = document.getElementById('download-modal');
    if (!modal) return;

    const modalTriggers = document.querySelectorAll('a[href="#tai-game"]');
    const modalCloses = modal.querySelectorAll('[data-modal-close]');
    const toggleTerms = document.getElementById('toggle-terms');
    const termsContent = document.getElementById('terms-content');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('is-open');
        });
    });

    modalCloses.forEach(close => {
        close.addEventListener('click', () => {
            modal.classList.remove('is-open');
        });
    });

    // Toggle terms content
    if (toggleTerms && termsContent) {
        toggleTerms.addEventListener('click', () => {
            const isVisible = termsContent.style.display !== 'none';
            termsContent.style.display = isVisible ? 'none' : 'block';
            toggleTerms.classList.toggle('active');
        });
    }

    // Terms acceptance checkbox functionality
    const acceptCheckbox = document.getElementById('accept-terms');
    const downloadDirect = document.getElementById('download-direct');
    const downloadMega = document.getElementById('download-mega');
    const downloadDirectSound = document.getElementById('download-direct-sound');
    const downloadMegaSound = document.getElementById('download-mega-sound');

    const updateDownloadButtons = () => {
        const isAccepted = acceptCheckbox.checked;
        const allButtons = [downloadDirect, downloadMega, downloadDirectSound, downloadMegaSound];
        allButtons.forEach(btn => {
            if (!btn) return;
            if (isAccepted) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        });
    };

    const preventDownload = (e) => {
        if (!acceptCheckbox.checked) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    if (acceptCheckbox) {
        // Initially disable buttons
        updateDownloadButtons();

        // Listen for checkbox changes
        acceptCheckbox.addEventListener('change', updateDownloadButtons);

        // Prevent download when not accepted for all buttons
        [downloadDirect, downloadMega, downloadDirectSound, downloadMegaSound].forEach(btn => {
            if (!btn) return;
            btn.addEventListener('click', preventDownload);
        });
    }

    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            modal.classList.remove('is-open');
        }
    });
};

// Initialize modal when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Call initDownloadModal after includes load
    setTimeout(initDownloadModal, 500);
});
