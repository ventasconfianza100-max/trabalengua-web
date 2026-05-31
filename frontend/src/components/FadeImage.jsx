import React, { useState } from "react";

/**
 * Imagen que aparece con un fade-in suave una vez cargada.
 * Mientras carga, se mantiene invisible sobre el fondo del contenedor
 * para que no se vea el texto alt ni un hueco brusco.
 *
 * Acepta las mismas props que <img>. La clase pasada en `className`
 * se aplica a la imagen; el efecto de opacidad se añade encima.
 */
export const FadeImage = ({ className = "", onLoad, style, ...props }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      loading={props.loading || "lazy"}
      decoding={props.decoding || "async"}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={className}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: "opacity 700ms ease-out",
      }}
    />
  );
};

export default FadeImage;
