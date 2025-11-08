import { render, screen, fireEvent } from '@testing-library/react';
import { UserMenu } from '../user-menu';

describe('UserMenu', () => {
  const mockProps = {
    displayName: 'John Doe',
    email: 'john@example.com',
    onSettingsClick: jest.fn(),
  };

  it('displays user name and email', () => {
    render(<UserMenu {...mockProps} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('opens dropdown on trigger click', () => {
    render(<UserMenu {...mockProps} />);
    const trigger = screen.getByLabelText('User menu');
    fireEvent.click(trigger);
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('calls onSettingsClick when Settings clicked', () => {
    render(<UserMenu {...mockProps} />);
    fireEvent.click(screen.getByLabelText('User menu'));
    fireEvent.click(screen.getByText('Settings'));
    expect(mockProps.onSettingsClick).toHaveBeenCalledTimes(1);
  });

  it('has accessible keyboard navigation', () => {
    render(<UserMenu {...mockProps} />);
    const trigger = screen.getByLabelText('User menu');

    // Enter key opens dropdown
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'Enter' });
    expect(screen.getByText('Settings')).toBeInTheDocument();

    // Escape key closes dropdown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });
});
