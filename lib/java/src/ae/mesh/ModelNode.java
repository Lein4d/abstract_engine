package ae.mesh;

import ae.util.NameDomain;

public final class ModelNode {
	
	public final String      name;
	public final MeshBuilder mesh;
	
	public ModelNode(final String name) {
		this.name = name;
		this.mesh = new MeshBuilder();
	}
	
	public ModelNode(
			final NameDomain<ModelNode> domain,
			final String                name) {
		
		this.name = domain.isNameAvailable(name) ?
			domain.addObject(this, name) : domain.addObject(this);
		this.mesh = new MeshBuilder();
	}
	
	public static final NameDomain<ModelNode> createDomain() {
		return new NameDomain<>("part_");
	}
}
