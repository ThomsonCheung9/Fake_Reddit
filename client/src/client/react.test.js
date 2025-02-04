import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Banner from './components/Banner.js';

// i have no idea
const mockedUsedNavigate = jest.fn();
jest.mock('react-router', () => ({
   ...jest.requireActual('react-router'),
   useNavigate: () => mockedUsedNavigate,
}));

const renderBanner = (userData) => {
  return render(
    <BrowserRouter>
      <Banner 
        userData={userData} 
        handleSearch={() => {}} 
        setCurrentView={() => {}} 
        currentView=""
        setUserData={() => {}}
        onWelcomePage={false}
      />
    </BrowserRouter>
  );
};

describe('Create Post Button', () => {
  test('is disabled (grey button) when user is not logged in (guest)', () => {
    renderBanner(null);
    
    const createPostButton = screen.getByRole('button', { name: /create post/i });
    expect(createPostButton).toHaveClass('createGreyButton');
  });

  test('is enabled (colored button) when user is logged in', () => {
    const loggedInUser = {
      displayName: 'TestUser',
      email: 'test@example.com'
    };
    
    renderBanner(loggedInUser);
    
    const createPostButton = screen.getByRole('button', { name: /create post/i });
    expect(createPostButton).toHaveClass('createPostButton');
  });
});