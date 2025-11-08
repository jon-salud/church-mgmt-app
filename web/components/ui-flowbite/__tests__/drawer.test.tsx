import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Drawer, DrawerHeader, DrawerBody, DrawerFooter } from '../drawer';

describe('Drawer', () => {
  beforeEach(() => {
    // Reset body styles
    document.body.style.overflow = '';
  });

  describe('Basic Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(
        <Drawer isOpen={false} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should render with default position (right)', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('right-0');
    });

    it('should render with left position', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}} position="left">
          <div>Content</div>
        </Drawer>
      );
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('left-0');
    });
  });

  describe('Accessibility', () => {
    it('should have role="dialog"', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument();
    });

    it('should have aria-modal="true"', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-labelledby when title is provided', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}} title="Test Title">
          <div>Content</div>
        </Drawer>
      );
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveAttribute('aria-labelledby');
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when backdrop is clicked', async () => {
      const onClose = jest.fn();
      const { container } = render(
        <Drawer isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Drawer>
      );

      const backdrop = container.querySelector('[data-testid="drawer-backdrop"]');
      fireEvent.click(backdrop!);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onClose when ESC key is pressed', async () => {
      const onClose = jest.fn();
      render(
        <Drawer isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Drawer>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call onClose when clicking inside drawer', () => {
      const onClose = jest.fn();
      render(
        <Drawer isOpen={true} onClose={onClose}>
          <div>Content</div>
        </Drawer>
      );

      fireEvent.click(screen.getByText('Content'));
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close when closeOnBackdrop is false', () => {
      const onClose = jest.fn();
      const { container } = render(
        <Drawer isOpen={true} onClose={onClose} closeOnBackdrop={false}>
          <div>Content</div>
        </Drawer>
      );

      const backdrop = container.querySelector('[data-testid="drawer-backdrop"]');
      fireEvent.click(backdrop!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not close when closeOnEscape is false', () => {
      const onClose = jest.fn();
      render(
        <Drawer isOpen={true} onClose={onClose} closeOnEscape={false}>
          <div>Content</div>
        </Drawer>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when drawer opens', () => {
      const { rerender } = render(
        <Drawer isOpen={false} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );

      expect(document.body.style.overflow).toBe('');

      rerender(
        <Drawer isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when drawer closes', () => {
      const { rerender } = render(
        <Drawer isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Drawer isOpen={false} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Focus Trap', () => {
    it('should trap focus within drawer', async () => {
      const user = userEvent.setup();
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </Drawer>
      );

      const first = screen.getByText('First');
      const third = screen.getByText('Third');

      // Focus first element
      first.focus();
      expect(first).toHaveFocus();

      // Tab should cycle to second
      await user.tab();
      expect(screen.getByText('Second')).toHaveFocus();

      // Tab should cycle to third
      await user.tab();
      expect(third).toHaveFocus();

      // Tab should cycle back to first
      await user.tab();
      expect(first).toHaveFocus();
    });

    it('should handle Shift+Tab for backward focus', async () => {
      const user = userEvent.setup();
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <button>First</button>
          <button>Second</button>
        </Drawer>
      );

      const first = screen.getByText('First');
      const second = screen.getByText('Second');

      first.focus();
      expect(first).toHaveFocus();

      // Shift+Tab should cycle to last
      await user.tab({ shift: true });
      expect(second).toHaveFocus();
    });
  });

  describe('Sub-components', () => {
    it('should render DrawerHeader correctly', () => {
      render(
        <DrawerHeader>
          <h2>Header Title</h2>
        </DrawerHeader>
      );
      expect(screen.getByText('Header Title')).toBeInTheDocument();
    });

    it('should render DrawerBody correctly', () => {
      render(
        <DrawerBody>
          <p>Body content</p>
        </DrawerBody>
      );
      expect(screen.getByText('Body content')).toBeInTheDocument();
    });

    it('should render DrawerFooter correctly', () => {
      render(
        <DrawerFooter>
          <button>Close</button>
        </DrawerFooter>
      );
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should compose sub-components within Drawer', () => {
      render(
        <Drawer isOpen={true} onClose={() => {}}>
          <DrawerHeader>
            <h2>Title</h2>
          </DrawerHeader>
          <DrawerBody>
            <p>Content</p>
          </DrawerBody>
          <DrawerFooter>
            <button>Action</button>
          </DrawerFooter>
        </Drawer>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
    });
  });

  describe('Width Variants', () => {
    it('should apply default width (md)', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}}>
          <div>Content</div>
        </Drawer>
      );
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('w-80');
    });

    it('should apply sm width', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}} width="sm">
          <div>Content</div>
        </Drawer>
      );
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('w-64');
    });

    it('should apply lg width', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}} width="lg">
          <div>Content</div>
        </Drawer>
      );
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('w-96');
    });

    it('should apply xl width', () => {
      const { container } = render(
        <Drawer isOpen={true} onClose={() => {}} width="xl">
          <div>Content</div>
        </Drawer>
      );
      const drawer = container.querySelector('[role="dialog"]');
      expect(drawer).toHaveClass('w-[32rem]');
    });
  });
});
