  /**
   * change observer to reset the focus on the first element when the step content changes
   */
  private contentChangeObserver() {
    const mutationObserver = new MutationObserver(mutations => {
      const addedElements = mutations
        .flatMap(mutation => Array.from(mutation.addedNodes))
        .filter(node => node.nodeType === Node.ELEMENT_NODE) as HTMLElement[];

      if (addedElements.length > 0 && this.isOpen) {
        setTimeout(() => {
          this.getFirstFocusableElement(addedElements)?.focus();
        });
      }
    });
    const stepContent = this.el.querySelector('details');
    if (stepContent) {
      mutationObserver.observe(stepContent, { childList: true, subtree: true });
    }
  }

  private getFirstFocusableElement(elements: HTMLElement[]): HTMLElement {
    for (const element of elements) {
      const focusableElement = element.parentElement.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableElement?.checkVisibility()) {
        return focusableElement as HTMLElement;
      }
    }
  }
