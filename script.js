window.onload = function () {
    //burger
    $('.burger_menu').on('click', function(){
        $('body').toggleClass('menu_active');
    });

    // for partners
    // сликер для двух полосок картинок, причем они не должны листаться синхронно + они листаются автоматически
    let setTimer;
    const partners = document.querySelector('.autoplay').innerHTML;
    let start = false;
    function slicker() {
        let sl_w = $('.partner:eq(0)').width(),
            cols = Math.round(window.innerWidth/sl_w) + 2;
        for(let i = 0; i < Math.round(cols / 3) + 1; i++)
            $('.autoplay, .autoplay2').append(partners);
  
        console.log(cols)
        if (start) {
            $('.autoplay').slick('unslick');
            $('.autoplay2').slick('unslick');
        }
        
        $('.autoplay').slick({
            infinite: true,
            slidesToShow: cols,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            variableWidth: true
        });
        setTimeout(function(){
          $('.autoplay2').slick({
            infinite: true,
            slidesToShow: cols,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            variableWidth: true
          });
        },800);
  
        sl_w = $('.partner:eq(0)').width();
        $('#companies .slick:eq(0)').css('margin-left', -sl_w + "px");
        $('#companies .slick:eq(1)').css('margin-left', -(sl_w / 2) + "px");
    }
    slicker();
    start = true;
    window.addEventListener("resize", function () {
        clearTimeout(setTimer);
        setTimer = setTimeout(() => { slicker(); }, 500);
    });
  //

    // for tarifs
    // при наведении блок увеличивается
    $('.tarif_category:not(.active)').hover(function () {
      $('.tarif_category.active').removeClass('active');
    });
    $( ".tarif_category:not(.active)").on( "mouseleave", function() {
      $('.tarif_category:eq(1)').addClass('active');
    } );
  //

    // for reviews
    // для того чтобы какие-то отзывы показывались а какие-то нет + для подсчета там при пролистывании
    $(".a").css('height', $('.aa > div:eq(0)').height());
    function aa(p){
        console.log(p)
        $('.aa > div').css('opacity', '0');
        setTimeout(function(){ $('.aa > div').css('display', 'block'); }, 0);
        $('.aa > div:eq(' + p + ')').css('display', 'block');
        setTimeout(function(){ $('.aa > div:eq(' + p + ')').css('opacity', '1'); }, 0);
        
        setTimeout(function(){
            $(".a").animate({
                'height': $('.aa > div:eq(' + p + ')').height()
            }, 300, "linear");
        }, 100);
  
        $('.ednum').html((p+1).toString().padStart(2, '0'))
    }
  
    // для листалки
    p = 0, pl = $('.aa > div').length - 1;
    $('.b1').on('click', function(){
        if(p == 0) p = pl;
        else p--;
        aa(p);
    });
    $('.b2').on('click', function(){
  
        if(p == pl) p = 0;
        else p++;
        aa(p);
    });
  //

    // for FAQ
    $('#AskList > div').on('click', function(){
        $('#AskList > div').removeClass('active');
        $(this).addClass('active');
    });
  };


document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('openFormBtn');
    const closeBtn = document.getElementById('closeFormBtn');
    const popup = document.getElementById('feedbackPopup');
    const form = document.getElementById('feedbackForm');
    const messageArea = document.getElementById('messageArea');
    const formFields = ['fio', 'email', 'phone', 'org', 'message', 'agree'];

    const FORMSPREE_URL = 'https://formspree.io/f/xvgebbey';

    openBtn.addEventListener('click', () => {
        popup.style.display = 'flex';
        history.pushState({ formOpen: true }, '', '#feedback');
        loadFormData();
    });

    closeBtn.addEventListener('click', closeForm);
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closeForm();
    });

    window.addEventListener('popstate', (e) => {
        if (!location.hash.includes('feedback')) {
            popup.style.display = 'none';
        }
    });

    function loadFormData() {
        formFields.forEach(field => {
            const elem = document.getElementById(field);
            if (!elem) return;
            const saved = localStorage.getItem(`feedback_${field}`);
            if (saved !== null) {
                if (elem.type === 'checkbox') {
                    elem.checked = saved === 'true';
                } else {
                    elem.value = saved;
                }
            }
        });
    }

    formFields.forEach(field => {
        const elem = document.getElementById(field);
        if (!elem) return;
        elem.addEventListener('input', () => {
            const value = elem.type === 'checkbox' ? elem.checked : elem.value;
            localStorage.setItem(`feedback_${field}`, value);
        });
    });

    function closeForm() {
        popup.style.display = 'none';
        history.back();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;

        messageArea.style.display = 'none';
        messageArea.textContent = '';

        try {
            const formData = new FormData(form);
            
            const email = document.getElementById('email').value;
            formData.append('_replyto', email);
            formData.append('_subject', 'Новое сообщение с формы обратной связи');

            const agreeCheckbox = document.getElementById('agree');
            if (agreeCheckbox) {
                formData.set('agree', agreeCheckbox.checked ? 'Да' : 'Нет');
            }

            console.log('Данные для отправки:');
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await fetch(FORMSPREE_URL, {
                method: 'POST',
                body: formData, 
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('Статус ответа:', response.status);

            if (response.ok) {
                showMessage('✅ Сообщение успешно отправлено!', 'success');
                formFields.forEach(field => localStorage.removeItem(`feedback_${field}`));
                form.reset();
            } else {
                let errorText = 'Ошибка отправки';
                try {
                    const result = await response.json();
                    errorText = result.error || JSON.stringify(result);
                } catch {
                    errorText = `Ошибка ${response.status}`;
                }
                throw new Error(errorText);
            }
        } catch (error) {
            console.error('Ошибка отправки:', error);
            
            
            let userMessage = error.message;
            if (error.message.includes('Bad form post request')) {
                userMessage = 'Неверный формат данных. Проверьте обязательные поля.';
            } else if (error.message.includes('Failed to fetch')) {
                userMessage = 'Проблема с интернет-соединением.';
            } else if (error.message.includes('confirm')) {
                userMessage = 'Требуется подтверждение email. Проверьте почту!';
            }
            
            showMessage(`❌ ${userMessage}`, 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    function showMessage(text, type) {
        messageArea.textContent = text;
        messageArea.className = type;
        messageArea.style.display = 'block';
        setTimeout(() => {
            messageArea.style.display = 'none';
        }, 5000);
    }

    if (location.hash === '#feedback') {
        popup.style.display = 'flex';
        loadFormData();
    }
});
