package ae.material1;

interface Signature {
	int      getParamCount();
	GlslType resolveSignature(final GlslType[] signature);
}
