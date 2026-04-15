import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {VoteButtons} from '../../components/VoteButtons';

const defaultProps = {
  score: 0,
  currentVote: null,
  onVoteUp: jest.fn(),
  onVoteDown: jest.fn(),
  disabled: false,
};

describe('VoteButtons', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the score', () => {
    render(<VoteButtons {...defaultProps} score={42} />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('renders a negative score', () => {
    render(<VoteButtons {...defaultProps} score={-7} />);
    expect(screen.getByText('-7')).toBeTruthy();
  });

  it('calls onVoteUp when the up button is pressed', () => {
    const onVoteUp = jest.fn();
    render(<VoteButtons {...defaultProps} onVoteUp={onVoteUp} />);
    fireEvent.press(screen.getByRole('button', {name: 'Vote up'}));
    expect(onVoteUp).toHaveBeenCalledTimes(1);
  });

  it('calls onVoteDown when the down button is pressed', () => {
    const onVoteDown = jest.fn();
    render(<VoteButtons {...defaultProps} onVoteDown={onVoteDown} />);
    fireEvent.press(screen.getByRole('button', {name: 'Vote down'}));
    expect(onVoteDown).toHaveBeenCalledTimes(1);
  });

  it('shows "Remove upvote" label when already upvoted', () => {
    render(<VoteButtons {...defaultProps} currentVote={1} />);
    expect(
      screen.getByRole('button', {name: 'Remove upvote'}),
    ).toBeTruthy();
  });

  it('shows "Remove downvote" label when already downvoted', () => {
    render(<VoteButtons {...defaultProps} currentVote={0} />);
    expect(
      screen.getByRole('button', {name: 'Remove downvote'}),
    ).toBeTruthy();
  });

  it('does not call onVoteUp or onVoteDown when disabled', () => {
    const onVoteUp = jest.fn();
    const onVoteDown = jest.fn();
    render(
      <VoteButtons
        {...defaultProps}
        onVoteUp={onVoteUp}
        onVoteDown={onVoteDown}
        disabled
      />,
    );
    fireEvent.press(screen.getByRole('button', {name: 'Vote up'}));
    fireEvent.press(screen.getByRole('button', {name: 'Vote down'}));
    expect(onVoteUp).not.toHaveBeenCalled();
    expect(onVoteDown).not.toHaveBeenCalled();
  });

  it('shows the score accessibility label', () => {
    render(<VoteButtons {...defaultProps} score={5} />);
    expect(screen.getByLabelText('Score: 5')).toBeTruthy();
  });
});
