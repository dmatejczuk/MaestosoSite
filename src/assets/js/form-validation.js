function validateForms() {
    const forms = document.querySelectorAll("form");

    forms.forEach(form => {
        const elements = form.querySelectorAll("input[maxlength].form-validation, textarea[maxlength].form-validation");

        elements.forEach(element => {
            const counter = setMaxLength(element);

            setCurrentChars(counter, element, checkFieldLength(element));

            element.addEventListener("input", () => {
                const fieldLength = checkFieldLength(element);
                setCurrentChars(counter, element, fieldLength);
            });
        });
    });

    function setCurrentChars(counter, element, currentChars) {
        const maxLength = Number(element.getAttribute("maxlength"));

        if (counter) {
            counter.querySelector("span").textContent = maxLength - currentChars;

            const ratio = currentChars / maxLength;

            counter.style.color = "";

            if (ratio >= 0.8) {
                counter.style.color = "red";
            } else if (ratio >= 0.6) {
                counter.style.color = "orange";
            } else {
                counter.style.color = "smokewhite";
            }
        }
    }

    function setMaxLength(element) {
        const p = document.createElement("p");

        p.classList.add("validation-message");
        
        p.innerHTML = `Pozostało znaków <span>0</span> / ${element.getAttribute("maxlength")}`;

        element.insertAdjacentElement("afterend", p);

        return p;
    }

    function checkFieldLength(element) {
        return element.value.length;
    }
}