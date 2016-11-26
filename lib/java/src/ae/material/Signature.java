package ae.material;

interface Signature {
	int      getParamCount();
	GlslType resolveSignature(final GlslType[] signature);
}
