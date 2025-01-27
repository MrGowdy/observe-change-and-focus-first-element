describe('contentChangeObserver', () => {
  // Mock MutationObserver
  const observe = jest.fn();
  const disconnect = jest.fn();
  const mutationObserverCallback = jest.fn();
  const mutationObserverMock = jest.fn().mockImplementation(callback => {
    mutationObserverCallback.mockImplementation(callback);
    return {
      observe,
      disconnect,
      takeRecords: jest.fn(),
    };
  });
  global.MutationObserver = mutationObserverMock;

  let page: SpecPage;
  let component: any;
  let details: HTMLDetailsElement;

  beforeEach(async () => {
    page = await newSpecPage({
      components: [$COMPONENT-NAME],
      template: () => {
        return <d$COMPONENT-NAME />;
      },
    });
    component = page.rootInstance;
    details = page.root.querySelector('#main');
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should focus the first focusable element when content changes', async () => {
    const button = document.createElement('button');
    const button2 = document.createElement('button');
    const getFirstFocusableElementSpy = jest.spyOn(
      component,
      'getFirstFocusableElement',
    );

    // Call the contentChangeObserver method to set up the observer
    component.contentChangeObserver();

    // Mock checkVisibility on the button element
    button.checkVisibility = jest.fn().mockReturnValue(true);

    // Append the buttons to trigger the mutation observer
    details.appendChild(button);
    details.appendChild(button2);

    // Manually trigger the mutation observer callback
    mutationObserverCallback([{ addedNodes: [button, button2] }]);

    // Check if the MutationObserver was called
    expect(observe).toHaveBeenCalled();
    expect(mutationObserverCallback).toHaveBeenCalled();

    jest.runAllTimers();

    expect(getFirstFocusableElementSpy).toHaveBeenCalledWith([button, button2]);
    setTimeout(() => {
      expect(document.activeElement).toBe(button);
    }, 200);
  });

  it('should ignore not focusable elements', async () => {
    const div = document.createElement('div');
    const getFirstFocusableElementSpy = jest.spyOn(
      component,
      'getFirstFocusableElement',
    );

    // Call the contentChangeObserver method to set up the observer
    component.contentChangeObserver();

    // Mock checkVisibility on the button element
    div.checkVisibility = jest.fn().mockReturnValue(true);

    // Append the buttons to trigger the mutation observer
    details.appendChild(div);

    // Manually trigger the mutation observer callback
    mutationObserverCallback([{ addedNodes: [div] }]);

    // Check if the MutationObserver was called
    expect(observe).toHaveBeenCalled();
    expect(mutationObserverCallback).toHaveBeenCalled();

    jest.runAllTimers();

    expect(getFirstFocusableElementSpy).toHaveBeenCalledWith([div]);
    setTimeout(() => {
      expect(document.activeElement).toBe(undefined);
    }, 200);
  });
});
