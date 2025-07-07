import React, { useState, useRef, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Box, Sphere, useGLTF } from "@react-three/drei";
import {
  ShoppingCart,
  Navigation,
  Package,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
} from "lucide-react";
import * as THREE from "three";

// Fixed camera positions for different areas
const cameraPositions = {
  stadium: {
    position: [0, 0.1, 1],
    target: [0, 0, 0],
    fov: 60,
  },
  locker: {
    position: [-13, 1.5, 4.5],
    target: [0, -5, 5],
    fov: 70,
  },
  golf: {
    position: [8, 0.5, 0.1],
    target: [20, 0, 0],
    fov: 70,
  },
};

// Product data with 3D positions adjusted for different areas
const products = {
  stadium: [
    { id: 1, name: "Stadium T-Shirt", price: 35, position: [0, 0.3, 0] },
    { id: 2, name: "Team Cap", price: 25, position: [2, 0.3, 0] },
    { id: 9, name: "Stadium Hoodie", price: 65, position: [-2, 0.3, 0] },
  ],
  locker: [
    { id: 3, name: "Basketball Jersey", price: 89, position: [-10, 0.5, 4.5] },
    { id: 4, name: "Athletic Shorts", price: 45, position: [-10, 0.5, 3.5] },
    { id: 5, name: "High-Top Sneakers", price: 150, position: [-10, 0.5, 5.5] },
  ],
  golf: [
    { id: 6, name: "Golf Driver", price: 299, position: [10, 0.3, 0.8] },
    { id: 7, name: "Golf Balls Set", price: 25, position: [10, 0.3, 0.1] },
    { id: 8, name: "Golf Glove", price: 35, position: [10, 0.3, -0.6] },
  ],
};

// Stadium GLB Model Component
function StadiumModel() {
  const { scene } = useGLTF("/assets/stadiumcomplex.glb");

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone();

  return <primitive object={clonedScene} />;
}

// Preload the GLB file
useGLTF.preload("/assets/stadiumcomplex.glb");

// Loading fallback component
function LoadingFallback() {
  return (
    <group>
      <Text
        position={[0, 0, 0]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Loading Stadium...
      </Text>
      <Box args={[0.5, 0.5, 0.5]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#4ecdc4" />
      </Box>
    </group>
  );
}

// Animated product display
function Product({ product, onAddToCart }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.3;
      meshRef.current.position.y =
        product.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={product.position}>
      <Box
        ref={meshRef}
        args={[0.4, 0.4, 0.4]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onAddToCart(product)}
      >
        <meshStandardMaterial
          color={hovered ? "#ff6b6b" : "#4ecdc4"}
          emissive={hovered ? "#ff3333" : "#2c3e50"}
          emissiveIntensity={hovered ? 0.3 : 0.1}
        />
      </Box>
      <Text
        position={[0, -0.8, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {product.name}
      </Text>
      <Text
        position={[0, -1.2, 0]}
        fontSize={0.25}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        ${product.price}
      </Text>
    </group>
  );
}

// Fixed Camera Controller - no user controls during transitions
function FixedCameraController({
  targetPosition,
  targetLookAt,
  targetFov,
  isAnimating,
  onAnimationComplete,
}) {
  const { camera } = useThree();
  const controlsRef = useRef();

  useFrame(() => {
    if (isAnimating && targetPosition && targetLookAt) {
      // Smoothly animate camera to target position
      camera.position.lerp(new THREE.Vector3(...targetPosition), 0.08);
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.08);
      camera.updateProjectionMatrix();

      // Update controls target
      if (controlsRef.current) {
        controlsRef.current.target.lerp(
          new THREE.Vector3(...targetLookAt),
          0.08
        );
        controlsRef.current.update();
      }

      // Check if animation is complete
      const distance = camera.position.distanceTo(
        new THREE.Vector3(...targetPosition)
      );
      if (distance < 0.5) {
        onAnimationComplete();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={false}
      enableRotate={false}
      maxPolarAngle={Math.PI / 2}
      minDistance={5}
      maxDistance={15}
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
}

// Main 3D scene component
function Scene3D({ currentArea, onAddToCart }) {
  const currentProducts = products[currentArea] || [];

  return (
    <>
      {/* Load the Stadium GLB Model */}
      <Suspense fallback={<LoadingFallback />}>
        <StadiumModel />
      </Suspense>

      {/* Products for current area only */}
      {currentProducts.map((product) => (
        <Product key={product.id} product={product} onAddToCart={onAddToCart} />
      ))}

      {/* Lighting setup */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[1, 3, 0]} intensity={0.8} />
      <pointLight position={[-20, 8, -5]} intensity={0.6} color="#ffffff" />
      <pointLight position={[20, 8, -5]} intensity={0.6} color="#ffffff" />

      {/* Stadium accent lights */}
      <Sphere args={[0.3]} position={[-10, 12, -10]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.3}
        />
      </Sphere>
      <Sphere args={[0.3]} position={[10, 12, -10]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.3}
        />
      </Sphere>
      <Sphere args={[0.3]} position={[-10, 12, 10]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.3}
        />
      </Sphere>
      <Sphere args={[0.3]} position={[10, 12, 10]}>
        <meshStandardMaterial
          color="#ffff00"
          emissive="#ffff00"
          emissiveIntensity={0.3}
        />
      </Sphere>
    </>
  );
}

// Teleport Arrow Component
function TeleportArrow({ direction, label, onClick, disabled }) {
  const getArrowIcon = () => {
    switch (direction) {
      case "left":
        return <ArrowLeft size={24} />;
      case "right":
        return <ArrowRight size={24} />;
      case "up":
        return <ArrowUp size={24} />;
      default:
        return <Navigation size={24} />;
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all
        ${
          disabled
            ? "bg-gray-700 text-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 active:scale-95"
        }
        shadow-lg backdrop-blur-sm
      `}
    >
      {getArrowIcon()}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

// Main App Component
export default function Stadium3DStore() {
  const [currentArea, setCurrentArea] = useState("stadium");
  const [isAnimating, setIsAnimating] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item, index) => index !== productId));
  };

  const handleTeleport = (targetArea) => {
    if (targetArea !== currentArea && !isAnimating) {
      setIsAnimating(true);
      setCurrentArea(targetArea);
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const currentProducts = products[currentArea] || [];

  // Get available teleport destinations
  const getAvailableDestinations = () => {
    const destinations = [];

    if (currentArea !== "locker") {
      destinations.push({
        area: "locker",
        label: "Locker Room",
        direction: "left",
      });
    }
    if (currentArea !== "stadium") {
      destinations.push({
        area: "stadium",
        label: "Main Stadium",
        direction: "up",
      });
    }
    if (currentArea !== "golf") {
      destinations.push({
        area: "golf",
        label: "Golf Sim",
        direction: "right",
      });
    }

    return destinations;
  };

  return (
    <div className="w-full h-screen bg-black relative">
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: cameraPositions.stadium.position,
          fov: cameraPositions.stadium.fov,
        }}
      >
        <Scene3D currentArea={currentArea} onAddToCart={addToCart} />

        <FixedCameraController
          targetPosition={cameraPositions[currentArea]?.position}
          targetLookAt={cameraPositions[currentArea]?.target}
          targetFov={cameraPositions[currentArea]?.fov}
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
      </Canvas>

      {/* Top UI Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-start">
        {/* Current Area Info */}
        <div className="flex flex-col gap-2">
          <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm">
            <MapPin size={16} />
            <span className="capitalize font-medium">
              {currentArea === "stadium"
                ? "Main Stadium"
                : currentArea === "locker"
                ? "Locker Room"
                : currentArea === "golf"
                ? "Golf Simulator"
                : currentArea}
            </span>
          </div>

          <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur-sm">
            <Package size={16} />
            <span className="text-sm">
              {currentProducts.length} items available
            </span>
          </div>
        </div>

        {/* Cart Button */}
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 backdrop-blur-sm"
        >
          <ShoppingCart size={20} />
          <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs min-w-6 text-center">
            {cart.length}
          </span>
        </button>
      </div>

      {/* Teleport Navigation Arrows */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 flex flex-col gap-3">
        {getAvailableDestinations().map((dest) => (
          <TeleportArrow
            key={dest.area}
            direction={dest.direction}
            label={dest.label}
            onClick={() => handleTeleport(dest.area)}
            disabled={isAnimating}
          />
        ))}
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="absolute top-0 right-0 w-80 h-full bg-gray-900/95 text-white p-4 z-20 overflow-y-auto backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart size={20} />
              Shopping Cart
            </h2>
            <button
              onClick={() => setShowCart(false)}
              className="text-gray-400 hover:text-white text-xl transition-colors"
            >
              ×
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Your cart is empty</p>
          ) : (
            <>
              <div className="space-y-3 mb-4">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/80 p-3 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-green-400">${item.price}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold">Total:</span>
                  <span className="text-lg font-bold text-green-400">
                    ${totalPrice}
                  </span>
                </div>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors">
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 z-10 bg-gray-800/90 text-white p-4 rounded-lg shadow-lg max-w-sm backdrop-blur-sm">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Navigation size={16} />
          Controls
        </h3>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>🎯 Use arrow buttons to navigate areas</li>
          <li>🖱️ Click and drag to look around</li>
          <li>🔍 Scroll to zoom in/out</li>
          <li>📦 Click floating products to add to cart</li>
          <li>🛒 Click cart icon to view purchases</li>
        </ul>
      </div>

      {/* Loading Overlay */}
      {isAnimating && (
        <div className="absolute inset-0 bg-black/20 z-30 flex items-center justify-center">
          <div className="bg-gray-800/90 text-white px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm">
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Moving to{" "}
              {currentArea === "stadium"
                ? "Main Stadium"
                : currentArea === "locker"
                ? "Locker Room"
                : "Golf Simulator"}
              ...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
