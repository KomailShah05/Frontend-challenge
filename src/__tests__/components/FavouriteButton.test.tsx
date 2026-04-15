import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {FavouriteButton} from '../../components/FavouriteButton';

describe('FavouriteButton', () => {
  it('renders the unfilled heart when not favourited', () => {
    render(
      <FavouriteButton isFavourited={false} onToggle={jest.fn()} disabled={false} />,
    );
    expect(screen.getByText('♡')).toBeTruthy();
  });

  it('renders the filled heart when favourited', () => {
    render(
      <FavouriteButton isFavourited onToggle={jest.fn()} disabled={false} />,
    );
    expect(screen.getByText('♥')).toBeTruthy();
  });

  it('calls onToggle when pressed', () => {
    const onToggle = jest.fn();
    render(
      <FavouriteButton isFavourited={false} onToggle={onToggle} disabled={false} />,
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does not call onToggle when disabled', () => {
    const onToggle = jest.fn();
    render(
      <FavouriteButton isFavourited={false} onToggle={onToggle} disabled />,
    );
    fireEvent.press(screen.getByRole('button'));
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('has the correct accessibility label when not favourited', () => {
    render(
      <FavouriteButton isFavourited={false} onToggle={jest.fn()} disabled={false} />,
    );
    expect(
      screen.getByRole('button', {name: 'Add to favourites'}),
    ).toBeTruthy();
  });

  it('has the correct accessibility label when favourited', () => {
    render(
      <FavouriteButton isFavourited onToggle={jest.fn()} disabled={false} />,
    );
    expect(
      screen.getByRole('button', {name: 'Remove from favourites'}),
    ).toBeTruthy();
  });
});
