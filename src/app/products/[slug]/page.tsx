"use client";

import React from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { PRODUCTS } from "../page";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="pt-32 pb-32 text-center min-h-screen bg-background flex flex-col justify-center items-center">
        <div className="font-mono text-xs text-accent tracking-widest uppercase mb-4">[ 404 // PLATFORM NOT FOUND ]</div>
        <h1 className="font-display text-4xl uppercase mb-8">Model Specification Unavailable</h1>
        <Link href="/products" className="font-mono text-xs uppercase border border-accent text-accent px-6 py-3">
          ← Return To Products Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-background">
      
      {/* Back Link */}
      <div className="px-[5vw] mb-8">
        <Link
          href="/products"
          className="font-mono text-xs uppercase tracking-widest text-foreground/50 hover:text-accent transition-colors"
        >
          ← Back to All Products
        </Link>
      </div>

      {/* Product Hero */}
      <header className="px-[5vw] mb-16 max-w-5xl">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
          [ {product.tag} // SPECIFICATION READOUT ]
        </div>
        <h1 className="font-display text-5xl md:text-7xl uppercase text-foreground leading-[0.9] mb-4">
          {product.name}
        </h1>
        <div className="font-mono text-sm text-accent uppercase tracking-widest mb-6">
          {product.category}
        </div>
        <p className="font-mono text-sm text-foreground/70 uppercase leading-relaxed max-w-3xl">
          {product.desc}
        </p>
      </header>

      {/* Tech Spec Cards Grid */}
      <section className="px-[5vw] mb-20 max-w-6xl mx-auto">
        <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-6">
          [ PLATFORM PARAMETERS ]
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {product.specs.map((spec, i) => (
            <div
              key={i}
              className="border border-foreground/10 p-6 backdrop-blur-md relative"
            >
              <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-2">
                [ PARAMETER 0{i + 1} ]
              </div>
              <div className="font-mono text-xs opacity-50 uppercase mb-2">{spec.label}</div>
              <div className="font-display text-3xl uppercase text-foreground">{spec.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture & CTA Section */}
      <section className="px-[5vw] pb-32 max-w-6xl mx-auto">
        <div className="border border-foreground/10 p-8 md:p-12 backdrop-blur-md">
          <div className="font-mono text-[10px] text-accent tracking-widest uppercase mb-4">
            [ DEPLOYMENT PROTOCOL ]
          </div>
          <h2 className="font-display text-3xl uppercase text-foreground mb-4">
            Custom System Configuration & Integration
          </h2>
          <p className="font-mono text-xs text-foreground/70 uppercase leading-relaxed max-w-3xl mb-8">
            Every {product.name} platform is calibrated to target operational parameters, including custom actuator torque curves, specialized end-effector tooling, and encrypted telemetry pipelines.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-4 border font-mono text-xs uppercase tracking-[0.18em] px-6 py-3 transition-all duration-200 border-accent text-accent hover:bg-accent/10"
          >
            <span>Request Technical Blueprint</span>
            <span className="w-4 h-4 border border-current flex items-center justify-center text-[10px]">
              +
            </span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
