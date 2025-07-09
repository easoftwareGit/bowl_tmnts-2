import React, { useState, useRef } from 'react';
import { Overlay, OverlayTrigger } from "react-bootstrap";

type MobileTooltipButtonProps = {
  renderTooltip: (props: any) => React.ReactNode;
  buttonClassName?: string; // allow custom button style
};

export const MobileTooltipButton: React.FC<MobileTooltipButtonProps> = ({
  renderTooltip,
  buttonClassName = 'btn-outline-secondary', // default fallback
}) => {
  const [show, setShow] = useState(false);
  const target = useRef(null);

  const handleClick = () => {
    setShow(true);
    // Auto-hide after 1.5 seconds
    setTimeout(() => setShow(false), 1500);
  };

  return (
    <>
      <button
        ref={target}
        type="button"
        className={`btn ${buttonClassName} ms-0`}      
        style={{ marginLeft: '8px' }}
        onClick={handleClick}
      >
        ?
      </button>
      <Overlay target={target.current} show={show} placement="right">
        {(props) => renderTooltip(props)}
      </Overlay>
    </>
  );
};

type ButtonWithTooltipProps = {
  onClick: () => void;
  isTouchDevice: boolean;
  renderTooltip: (props: any) => React.ReactNode;
  buttonText: string;
  buttonColor: string; // "success", "info", etc.
  icon: React.ReactNode;
};

export const ButtonWithTooltip: React.FC<ButtonWithTooltipProps> = ({
  onClick,
  isTouchDevice,
  renderTooltip,
  buttonText,
  buttonColor,
  icon,
}) => {
  const btnClass = `btn btn-${buttonColor}`;
  const outlineClass = `btn-outline-${buttonColor}`;

  if (isTouchDevice) {
    return (
      <>
        <button type="button" className={btnClass} onClick={onClick}>
          {icon}
          &ensp;{buttonText}
        </button>
        <MobileTooltipButton
          renderTooltip={renderTooltip}
          buttonClassName={outlineClass}
        />
      </>
    );
  }

  return (
    <OverlayTrigger placement="right" delay={{ show: 250, hide: 1000 }} overlay={renderTooltip}>
      <span className="d-inline-block">
        <button type="button" className={btnClass} onClick={onClick}>
          {icon}
          &ensp;{buttonText}
        </button>
      </span>
    </OverlayTrigger>
  );
};
