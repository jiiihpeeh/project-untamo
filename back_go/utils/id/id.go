package id

import "go.mongodb.org/mongo-driver/bson/primitive"

func GenerateId() primitive.ObjectID {
	return primitive.NewObjectID()
}

func IdFromString(id string) (primitive.ObjectID, error) {
	idPrimitive, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return GenerateId(), nil
	}
	return idPrimitive, nil
}
