import { ref, onMounted, onUnmounted } from "vue";

export function useScrollReveal() {
  const observerRef = ref<IntersectionObserver | null>(null);

  onMounted(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      // Show all elements immediately if user prefers reduced motion
      document.querySelectorAll(".scroll-reveal").forEach((el) => {
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "none";
      });
      return;
    }

    observerRef.value = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observerRef.value?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    // Observe all elements with scroll-reveal class
    document.querySelectorAll(".scroll-reveal").forEach((el) => {
      observerRef.value?.observe(el);
    });
  });

  onUnmounted(() => {
    observerRef.value?.disconnect();
  });
}
