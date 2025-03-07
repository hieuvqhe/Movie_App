import React from 'react';
import styled from 'styled-components';

interface ButtonLoaderProps {
  size?: number;
}

const ButtonLoader: React.FC<ButtonLoaderProps> = ({ size = 24 }) => {
  return (
    <LoaderWrapper size={size}>
      <div className="loader-container">
        <span />
        <span />
        <span />
        <span />
      </div>
    </LoaderWrapper>
  );
};

interface LoaderWrapperProps {
  size: number;
}

const LoaderWrapper = styled.div<LoaderWrapperProps>`
  display: inline-block;
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin-right: 8px;
  
  .loader-container {
    position: absolute;
    top: 50%;
    left: 50%;
    border-radius: 50%;
    height: ${props => props.size}px;
    width: ${props => props.size}px;
    animation: rotate_loader 1.2s linear infinite;
    background-color: #9b59b6;
    background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
    transform-origin: center;
    transform: translate(-50%, -50%);
  }

  .loader-container span {
    position: absolute;
    border-radius: 50%;
    height: 100%;
    width: 100%;
    background-color: #9b59b6;
    background-image: linear-gradient(#9b59b6, #84cdfa, #5ad1cd);
  }

  .loader-container span:nth-of-type(1) {
    filter: blur(1px);
  }

  .loader-container span:nth-of-type(2) {
    filter: blur(2px);
  }

  .loader-container span:nth-of-type(3) {
    filter: blur(4px);
  }

  .loader-container span:nth-of-type(4) {
    filter: blur(8px);
  }

  .loader-container::after {
    content: "";
    position: absolute;
    top: 15%;
    left: 15%;
    right: 15%;
    bottom: 15%;
    background-color: #fff;
    border: solid ${props => Math.max(1, props.size * 0.05)}px #ffffff;
    border-radius: 50%;
  }

  @keyframes rotate_loader {
    from {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;

export default ButtonLoader;
