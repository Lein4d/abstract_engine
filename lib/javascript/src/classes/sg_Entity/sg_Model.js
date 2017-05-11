
// ae.scenegraph.Model
class AEClassModel extends AEClassEntity {
	
	// Attributes neccessary for each model
	mesh:     ae.sg.Attribute<ae.mesh.Mesh>;
	material: ae.sg.Attribute<ae.mat.Material>;
	
	// Optional attributes for ease use with standard materials
	//public final ConstAttribute<StandardMaterials.Textures> textures  =
	//	new ConstAttribute<>(new StandardMaterials.Textures(null, null, null));
	colorMask: ae.sg.ConstAttribute<ae.math.Vector3D>;
	
	constructor(
			sceneGraph: ae.core.SceneGraph,
			name:       (string | null) = null) {
		
		super(sceneGraph, _aeEnumEntityType.MODEL, name, false, false, true);
		
		this.mesh      = new AEClassAttribute();
		this.material  = new AEClassAttribute();
		this.colorMask = new AEClassConstAttribute(ae.math.WHITE.xyz.cloneStatic());
		
		Object.freeze(this);
	}
	
	drawInstances(
			gl:          WebGLRenderingContext,
			projection:  ae.math.Matrix4D,
			useMaterial: boolean): void {
		
		const activeMesh     = this.mesh    .activeValue;
		const activeMaterial = this.material.activeValue;
		
		// Sanity check to ensure the model is complete and can be rendered
		if(activeMesh === null || activeMaterial === null) return;
		
		// This command will be ignored if the material is no standard material
		//sceneGraph.engine.standardMaterials.setMaterialData(
		//	activeMaterial,
		//	textures .getActiveValue(),
		//	colorMask.getActiveValue());

		if(activeMesh.cullFacing) {
			gl.enable(gl.CULL_FACE);
		} else {
			gl.disable(gl.CULL_FACE);
		}
		
		if(useMaterial) activeMaterial._use();
		
		this.instances.forEach((instance) => {
			
			this.sceneGraph.engine.state._newModelInstance(instance);
			this.sceneGraph.engine.state._applyUniformsToShader(gl);
			
			// TODO: Remove
			//instance.tfToCameraSpace.applyToShader(gl, this.sceneGraph.engine.uniLocModelView);
			
			activeMesh.draw(gl);
		});
	}
	
	get complete(): boolean {
		return this.mesh.activeValue !== null &&
			this.material.activeValue !== null;
	}

	setColorMaskA(mask: ae.math.Vector3D): this {
		// $NOT_NULL: 'value'
		this.colorMask.value.setData(mask);
		return this;
	}

	setColorMaskB(
			red:   number,
			green: number,
			blue:  number): this {
		
		// $NOT_NULL: 'value'
		this.colorMask.value.setDataDirect(red, green, blue);
		return this;
	}
	/*
	public final Model setDiffuseTexture(final Texture texture) {
		textures.getValue().diffuse = texture;
		return this;
	}

	public final Model setEmissiveTexture(final Texture texture) {
		textures.getValue().emissive = texture;
		return this;
	}
	
	public final Model setNormalMapTexture(final Texture texture) {
		textures.getValue().normalMap = texture;
		return this;
	}
	*/
	setMesh(mesh: ae.mesh.Mesh): this {
		this.mesh.internalValue = mesh;
		return this;
	}
	
	setMaterial(material: (ae.mat.Material | null)): this {
		this.material.internalValue = material;
		return this;
	}
}
