import React from 'react';
import styled from 'styled-components';

interface LoaderProps {
  size?: number;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 96, className = '' }) => {
  return (
    <StyledWrapper size={size} className={className}>
      <div className="container">
        <span />
        <span />
        <span />
        <span />
      </div>
    </StyledWrapper>
  );
}

interface StyledWrapperProps {
  size: number;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  
  .container {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    animation: rotate_3922 1.2s linear infinite;
    background-color: #9b59b6;
    background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
  }

  .container span {
    position: absolute;
    border-radius: 50%;
    height: 100%;
    width: 100%;
    background-color: #9b59b6;
    background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
  }

  .container span:nth-of-type(1) {
    filter: blur(5px);
  }

  .container span:nth-of-type(2) {
    filter: blur(10px);
  }

  .container span:nth-of-type(3) {
    filter: blur(25px);
  }

  .container span:nth-of-type(4) {
    filter: blur(50px);
  }

  .container::after {
    content: "";
    position: absolute;
    top: 10%;
    left: 10%;
    right: 10%;
    bottom: 10%;
    background-color: #fff;
    border: solid ${props => props.size * 0.05}px #ffffff;
    border-radius: 50%;
  }

  @keyframes rotate_3922 {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;

export default Loader;
