document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll("[data-scroll-to]").forEach(element =>
		element.onclick = e => {
			const target = document.querySelector(`#${element.dataset.scrollTo}`);
			if (!target) return;

			e.preventDefault();

			target.scrollIntoView({
				behavior: "smooth"
			});

			requestAnimationFrame(() => {
				target.focus({ preventScroll: true });
			});
		}
	);
	const scrollTopButton = document.querySelector("[data-scroll-top]");
	if (scrollTopButton) {
		scrollTopButton.onclick = () => {
			window.scrollTo({
				top: 0,
				behavior: "smooth"
			});
		};
		const toggleButton = () => {
			if (window.scrollY > 300) {
				scrollTopButton.classList.add("is-visible");
			} else {
				scrollTopButton.classList.remove("is-visible");
			}
		};
		window.addEventListener("scroll", toggleButton);
		toggleButton();
	}
});